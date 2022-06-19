import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { format } from 'bytes'
import * as moment from 'moment'
import { catchError, from, switchMap } from 'rxjs'
import { AssignmentSubmissionService } from 'src/assignment/assignment.service'
import { saveStream } from 'src/files/utils/file-upload.utils'
import { Document } from '../dtos'
import { TelegramAccount } from '../entities/telegram-account.entity'
import { Handler } from '../interfaces/hanlder.interface'
import { FormattingOption } from '../telegram.constants'
import { TelegramService } from '../telegram.service'

@Injectable()
export class FileSubmissionHandler implements Handler {
  private logger = new Logger(FileSubmissionHandler.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @Inject(forwardRef(() => AssignmentSubmissionService))
    private assignmentSubmissionService: AssignmentSubmissionService,
  ) {}
  handle(account: TelegramAccount, document: Document) {
    // get filesize in MBs (integer)
    const fileSize = parseInt(
      format(document.file_size, {
        unit: 'MB',
        unitSeparator: ' ',
      }).split(' ')[0],
    )
    if (fileSize >= 20) {
      return from(this.telegramService.cancelSubmission(account.id))
        .pipe(
          switchMap(account =>
            this.telegramService.sendMessage({
              chat_id: account.chat_id,
              text: 'File size too large. Please try again with a file less than <u>20 MB</u>',
              parse_mode: FormattingOption.HTML,
            }),
          ),
        )
        .subscribe({
          error: this.logger.error,
        })
    } else {
      from(this.telegramService.getPendingSubmission(account.id))
        .pipe(
          switchMap(assignment => {
            const diff = moment(assignment.submissionDeadline).diff(moment())
            if (diff <= 0) {
              return this.telegramService.sendMessage({
                text: `Assignment ended ${moment
                  .duration(diff)
                  .humanize()} ago`,
                chat_id: account.chat_id,
              })
            } else {
              return this.telegramService.getFile(document.file_id).pipe(
                switchMap(telegramFile =>
                  this.telegramService.downloadFile(telegramFile.file_path),
                ),
                switchMap(fileStream =>
                  from(saveStream(fileStream, document.file_name)),
                ),
                switchMap(submissionName => {
                  return this.assignmentSubmissionService.createAssignmentSubmission(
                    {
                      studentId: account.user.id,
                      definitionId: assignment.id,
                      submissionDate: new Date(),
                    },
                    submissionName,
                  )
                }),
                switchMap(() =>
                  from(this.telegramService.cancelSubmission(account.id)),
                ),
                switchMap(() => {
                  return this.telegramService.sendMessage({
                    text: `Submission complete for assignment <b>${assignment.name}</b>.`,
                    chat_id: account.chat_id,
                    parse_mode: FormattingOption.HTML,
                  })
                }),
              )
            }
          }),
          catchError(error => {
            this.logger.error(error)
            return this.telegramService.sendMessage({
              text: 'Error uploading file. Please try submitting again',
              chat_id: account.chat_id,
            })
          }),
        )
        .subscribe({
          next: () => {
            this.telegramService
              .sendMessage({
                text: `Submission for ${account.pendingSubmission.name} complete`,
                chat_id: account.chat_id,
              })
              .subscribe()
          },
          error: this.logger.error,
        })
    }
  }
}

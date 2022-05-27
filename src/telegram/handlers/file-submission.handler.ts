import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { format } from 'bytes'
import { createWriteStream } from 'fs'
import { join } from 'path'
import { catchError, from, switchMap } from 'rxjs'
import { editFileName } from 'src/files/utils/file-upload.utils'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { Document } from '../dtos'
import { TelegramAccount } from '../entities/telegram-account.entity'
import { Handler } from '../interfaces/hanlder.interface'
import { FormattingOption } from '../telegram.constants'
import { TelegramService } from '../telegram.service'

const pipelinePromise = promisify(pipeline)

@Injectable()
export class FileSubmissionHandler implements Handler {
  private logger = new Logger(FileSubmissionHandler.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
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
      this.telegramService
        .getFile(document.file_id)
        .pipe(
          switchMap(telegramFile =>
            this.telegramService.downloadFile(telegramFile.file_path),
          ),
          switchMap(fileStream => {
            const newFileName = editFileName(document.file_name)
            const writer = createWriteStream(
              join(__dirname, '../../upload', `${newFileName}`),
            )
            return from(pipelinePromise(fileStream, writer))
          }),
          switchMap(() =>
            from(this.telegramService.cancelSubmission(account.id)),
          ),
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

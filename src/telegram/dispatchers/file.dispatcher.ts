import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { from } from 'rxjs'
import { FileMessage, MessageUpdate } from '../dtos'
import { FileSubmissionHandler } from '../handlers/file-submission.handler'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { TelegramService } from '../telegram.service'

@Injectable()
export class FileDispatcher implements Dispatcher {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private fileSubmissionHandler: FileSubmissionHandler,
  ) {}
  dispatch(update: MessageUpdate<FileMessage>) {
    from(
      this.telegramService.findOneById(update.message.from.id, true),
    ).subscribe({
      next: account => {
        if (account.pendingSubmission) {
          this.fileSubmissionHandler.handle(account, update.message.document)
        }
      },
    })
  }
}

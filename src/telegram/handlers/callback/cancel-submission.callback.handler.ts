import { Injectable, Logger } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { TextMessage } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class CancelSubmissionCallbackHandler implements Handler {
  private logger = new Logger(CancelSubmissionCallbackHandler.name)
  constructor(private telegramService: TelegramService) {}
  handle(message: TextMessage) {
    from(this.telegramService.cancelSubmission(message.chat.id))
      .pipe(
        switchMap(() =>
          this.telegramService.editMessageText({
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: `Submission Canceled`,
          }),
        ),
      )
      .subscribe({
        error: error => this.logger.error(error),
      })
  }
}

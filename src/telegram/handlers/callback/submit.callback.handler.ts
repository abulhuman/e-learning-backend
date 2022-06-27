import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { Message } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { FormattingOption } from 'src/telegram/telegram.constants'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class SubmitCallbackHandler implements Handler {
  private logger = new Logger(SubmitCallbackHandler.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}
  handle(message: Message, payload: string) {
    from(this.telegramService.setAsSubmitting(message.chat.id, payload))
      .pipe(
        switchMap(account =>
          this.telegramService.editMessageText({
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: `Send your submission for assignmment <b>${account.pendingSubmission.name}</b>`,
            parse_mode: FormattingOption.HTML,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Cancel',
                    callback_data: 'cancel_submission',
                  },
                ],
              ],
            },
          }),
        ),
      )
      .subscribe({
        error: error => this.logger.error(error),
      })
  }
}

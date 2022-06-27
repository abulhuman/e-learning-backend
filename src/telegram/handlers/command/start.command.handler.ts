import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { from, map } from 'rxjs'
import { TextMessage } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class StartCommandHandler implements Handler {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private configService: ConfigService,
  ) {}
  handle(message: TextMessage) {
    from(this.telegramService.findOneById(message.from.id))
      .pipe(
        map(account => {
          if (account === undefined) {
            return {
              text: `Welcome ${message.from.first_name}. \n Please authorize your E-Learning account below`,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Authorize 🔒',
                      url: `${this.configService.get(
                        'TELEGRAM_AUTH_URL',
                      )}?userId=${message.from.id}&chatId=${
                        message.chat.id
                      }&name=${message.from.first_name}`,
                    },
                  ],
                ],
              },
            }
          } else {
            return {
              text: `Welcome back ${message.from.first_name}`,
            }
          }
        }),
      )
      .subscribe({
        next: messageToSend =>
          this.telegramService
            .sendMessage({
              ...messageToSend,
              chat_id: message.chat.id,
            })
            .subscribe(),
      })
  }
}

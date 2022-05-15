import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { from, map } from 'rxjs'
import { Message } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class StartCommandHandler implements Handler {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private configService: ConfigService,
  ) {}
  handle(message: Message, payload: string[]) {
    const isAuthorized = payload.join('') === message.from.id
    if (isAuthorized) {
      return this.telegramService
        .sendMessage({
          text: 'Successfully Authorized',
          chat_id: message.chat.id,
        })
        .subscribe()
    } else {
      from(this.telegramService.accountExists(message.from.id))
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
}

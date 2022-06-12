import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class UnknownCommandHandler implements Handler {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}
  handle(message, command) {
    this.telegramService
      .sendMessage({
        text: `Unknown Command "${command}"`,
        chat_id: message.chat.id,
      })
      .subscribe()
  }
}

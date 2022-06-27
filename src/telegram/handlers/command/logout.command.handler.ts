import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { from, switchMap } from 'rxjs'
import { TextMessage } from 'src/telegram/dtos'
import { TelegramAccount } from 'src/telegram/entities/telegram-account.entity'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import {
  BotCommandScopeType,
  DEFAULT_COMMANDS,
} from 'src/telegram/telegram.constants'
import { TelegramService } from 'src/telegram/telegram.service'
import { Repository } from 'typeorm'

@Injectable()
export class LogoutCommandHander implements Handler {
  private readonly logger = new Logger(LogoutCommandHander.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @InjectRepository(TelegramAccount)
    private telegramAccountRepo: Repository<TelegramAccount>,
  ) {}
  handle(message: TextMessage) {
    from(this.telegramAccountRepo.delete(message.from.id))
      .pipe(
        switchMap(() =>
          this.telegramService.setMyCommands({
            commands: DEFAULT_COMMANDS,
            scope: {
              type: BotCommandScopeType.CHAT,
              chat_id: message.chat.id,
            },
          }),
        ),
        switchMap(() =>
          this.telegramService.sendMessage({
            text: 'Successfully Unauthorized',
            chat_id: message.chat.id,
          }),
        ),
      )
      .subscribe({
        error: error => {
          this.logger.error(error)
          this.telegramService
            .sendMessage({
              text: error.message,
              chat_id: message.chat.id,
            })
            .subscribe()
        },
      })
  }
}

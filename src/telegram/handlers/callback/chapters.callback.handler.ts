import { Injectable } from '@nestjs/common'
import { CallbackQuery } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class ChaptersCallbackHandler implements Handler {
  constructor(private telegramService: TelegramService) {}
  handle(courseId: string, callback_query: CallbackQuery) {
    this.telegramService
      .answerCallbackQuery({
        callback_query_id: callback_query.id,
        text: 'Fetching Chapters',
      })
      .subscribe({
        error: error => {
          console.error(error)
        },
      })
  }
}

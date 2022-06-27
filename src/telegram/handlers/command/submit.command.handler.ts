import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { from, map, switchMap } from 'rxjs'
import { InlineKeybardMarkup, TextMessage } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'
import * as moment from 'moment'
@Injectable()
export class SubmitCommandHandler implements Handler {
  logger = new Logger(SubmitCommandHandler.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
  ) {}
  handle(message: TextMessage) {
    from(this.telegramService.findOneById(message.from.id, true))
      .pipe(
        switchMap(account =>
          this.telegramService.findAssignmentsForUser(account.user.id),
        ),
        map(assignments =>
          assignments.filter(assignment => {
            moment(assignment.submissionDeadline).diff(moment()) > 0
          }),
        ),
        switchMap(assignments => {
          let text: string
          const buttons: InlineKeybardMarkup = {
            inline_keyboard: [],
          }
          if (!assignments.length) {
            text = 'No assignments yet'
          } else {
            text = 'Select Assignment'
            assignments.forEach(assignment => {
              buttons.inline_keyboard.push([
                {
                  text: `${assignment.name}`,
                  callback_data: `submit ${assignment.id}`,
                },
                {
                  text: '📂️',
                  callback_data: `instructions ${assignment.id}`,
                },
              ])
            })
            buttons.inline_keyboard.push([
              {
                text: 'Cancel',
                callback_data: 'cancel',
              },
            ])
          }
          return this.telegramService.sendMessage({
            text,
            reply_markup: buttons,
            chat_id: message.chat.id,
          })
        }),
      )
      .subscribe({
        error: error => this.logger.error(error),
      })
  }
}

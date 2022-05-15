import { Injectable } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { CourseService } from 'src/course/course.service'
import { Message } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { FormattingOption } from 'src/telegram/telegram.constants'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class MyCoursesCommandHandler implements Handler {
  constructor(
    private courseService: CourseService,
    private telegramService: TelegramService,
  ) {}

  handle(message: Message) {
    from(this.telegramService.findOneById(message.from.id, true))
      .pipe(
        switchMap(account => {
          if (account === undefined) {
            throw new Error('Please Authorize the application first')
          }
          return this.courseService.findCoursesForUser(account.user.id)
        }),
      )
      .subscribe({
        next: courses => {
          if (courses.length === 0) {
            return this.telegramService
              .sendMessage({
                text: 'You currently have no courses. Contact administrator for more info',
                chat_id: message.chat.id,
              })
              .subscribe()
          }
          courses.forEach(course => {
            let text = ''
            text = text.concat(
              `<u><b>${course.name}</b>    (<i>${course.code}</i>\)</u>\n\n))`,
            )
            text = text.concat(`${course.description}`)
            this.telegramService
              .sendMessage({
                text,
                chat_id: message.chat.id,
                parse_mode: FormattingOption.HTML,
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Chapters 📖',
                        callback_data: `chapters ${course.id}`,
                      },
                      {
                        text: 'Files 📁',
                        callback_data: `files ${course.id}`,
                      },
                    ],
                  ],
                },
              })
              .subscribe()
          })
        },
        error: (error: Error) => {
          this.telegramService
            .sendMessage({
              text: error?.message,
              chat_id: message.chat.id,
            })
            .subscribe()
        },
      })
  }
}

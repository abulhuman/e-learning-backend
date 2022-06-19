import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { CourseService } from 'src/course/course.service'
import { CallbackQuery } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { FormattingOption } from 'src/telegram/telegram.constants'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class ChaptersCallbackHandler implements Handler {
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private courseServce: CourseService,
  ) {}
  handle(courseId: string, callback_query: CallbackQuery) {
    this.telegramService
      .answerCallbackQuery({
        callback_query_id: callback_query.id,
        text: 'Fetching Chapters',
      })
      .pipe(
        switchMap(() =>
          from(this.courseServce.findChaptersForCourse(courseId)),
        ),
        switchMap(chapters => {
          let text = ''
          chapters
            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
            .forEach(({ sequenceNumber, title, subChapters }) => {
              text = text.concat(
                `<u>Chapter ${sequenceNumber} <b>${title}</b></u>\n`,
              )
              if (subChapters.length) {
                subChapters
                  .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                  .forEach(subChapter => {
                    text = text.concat(
                      `\t${sequenceNumber}.${subChapter.sequenceNumber}: ${subChapter.title}`,
                    )
                  })
              }
            })
          return this.telegramService.editMessageText({
            text,
            chat_id: callback_query.message.chat.id,
            message_id: callback_query.message.message_id,
            parse_mode: FormattingOption.HTML,
          })
        }),
      )
      .subscribe({
        error: error => {
          console.error(error)
        },
      })
  }
}

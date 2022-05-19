import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { Server } from 'http'
import { from, map, switchMap, tap, throwError } from 'rxjs'
import { AppService } from 'src/app/app.service'
import { CourseService } from 'src/course/course.service'
import { CallbackQuery } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'
@Injectable()
export class CourseFilesCallbackHandler implements Handler {
  constructor(
    private courseService: CourseService,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private appService: AppService,
  ) {}
  handle(courseId: string, callback_query: CallbackQuery) {
    from(this.courseService.findCourseDocumentsForCourse(courseId))
      .pipe(
        tap(documents => {
          if (!documents.length) {
            throwError(() => new Error('Course has no files'))
          }
        }),
        switchMap(documents => {
          return this.telegramService
            .answerCallbackQuery({
              callback_query_id: callback_query.id,
              text: `Sending ${documents.length} documents`,
            })
            .pipe(switchMap(() => documents))
        }),
        switchMap(document => {
          return this.telegramService.sendDocument({
            chat_id: callback_query.message.chat.id,
            document: `${this.appService.appUrl}/upload/${document.storedFileName}`,
          })
        }),
      )
      .subscribe({
        error: error => {
          this.telegramService
            .answerCallbackQuery({
              callback_query_id: callback_query.id,
              text: error.message,
              show_alert: true,
            })
            .subscribe()
        },
      })
  }
}

import { Injectable, Logger } from '@nestjs/common'
import moment from 'moment'
import { from, switchMap } from 'rxjs'
import { FormattingOption } from 'src/telegram/telegram.constants'
import { TelegramService } from 'src/telegram/telegram.service'
import { ClassCourseNotification } from './dto/class-course-notification.dto'
import { CourseNotification } from './dto/course-notification.dto'

@Injectable()
export class TelegramNotificationService {
  private logger = new Logger(TelegramNotificationService.name)
  constructor(private telegramService: TelegramService) {}

  sendCourseAdditionNotification(notification: CourseNotification) {
    const { recipient, course, created_at } = notification
    from(this.telegramService.findOneByUserId(recipient.id))
      .pipe(
        switchMap(account => {
          if (!!account) {
            return this.telegramService.sendMessage({
              text: `⏰️ Added to course ${
                course.name
              } on <i>${created_at.toDateString()}</i>`,
              chat_id: account.chat_id,
              parse_mode: FormattingOption.HTML,
            })
          }
        }),
      )
      .subscribe({
        error: error => this.logger.error(error),
      })
  }
}

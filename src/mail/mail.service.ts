import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CourseAdditionNotification } from 'src/notification/dto/course-addition-notification.dto'

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendVerificationEmail(email: string, token: string, name: string) {
    const url = `${this.configService.get(
      'EMAIL_VERIFICATION_URL',
    )}?token=${token}`
    return this.mailerService.sendMail({
      to: email,
      subject: 'Verify Account Email',
      template: '/verification',
      context: {
        url,
        name,
      },
    })
  }

  async sendCourseAdditionEmail(newNotification: CourseAdditionNotification) {
    const { course, recipient, created_at } = newNotification
    return this.mailerService.sendMail({
      to: recipient.email,
      subject: `Added to course ${course.name}`,
      template: '/course-addition',
      context: {
        course,
        name: recipient.firstName + recipient.lastName,
        at: created_at.toDateString(),
      },
    })
  }
}

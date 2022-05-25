import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { CourseAdditionNotification } from 'src/notification/dto/course-addition-notification.dto'
import { User } from 'src/users/entities/user.entity'

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name)
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
    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `Added to course ${course.name}`,
        template: '/course-addition',
        context: {
          course,
          name: recipient.firstName + recipient.lastName,
          at: created_at.toDateString(),
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async sendAssignmentDeadlineReminder(
    user: User,
    assignment: AssignmentDefinition,
    deadlineText: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Assignment Reminder for ${assignment.name}`,
        template: '/assignment-reminder',
        context: {
          name: user.firstName,
          assignmentName: assignment.name,
          courseName: assignment.course.name,
          deadlineText,
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }
}

import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as moment from 'moment'
import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { AuthService } from 'src/auth/auth.service'
import { ClassCourseNotification } from 'src/notification/dto/class-course-notification.dto'
import { CourseNotification } from 'src/notification/dto/course-notification.dto'
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

  async sendCourseAdditionEmail(notification: CourseNotification) {
    const { course, recipient, created_at } = notification
    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `Added to course ${course.name}`,
        template: '/course-addition',
        context: {
          course,
          name: [recipient.firstName, recipient.lastName].join(' '),
          at: created_at.toDateString(),
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async sendTeacherCourseAssignment(notification: CourseNotification) {
    const { course, recipient, created_at } = notification
    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `Assigned to course ${course.name}`,
        template: '/teacher-course-assignment',
        context: {
          course,
          name: [recipient.firstName, recipient.lastName].join(' '),
          at: created_at.toDateString(),
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async sendClassCourseAssignment(notification: ClassCourseNotification) {
    const { course, studentClass, recipient, created_at } = notification

    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `Class ${studentClass.section} added to course ${course.name}`,
        template: '/class-course-assignment',
        context: {
          course,
          studentClass,
          name: [recipient.firstName, recipient.lastName].join(' '),
          at: created_at.toDateString(),
        },
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async sendAssignmentCreationEmail(
    user: User,
    assignment: AssignmentDefinition,
  ) {
    try {
      this.mailerService.sendMail({
        to: user.email,
        subject: `New assignment on ${assignment.course.name}`,
        template: '/new-assignment',
        context: {
          name: user.firstName,
          courseName: assignment.course.name,
          assignmentName: assignment.name,
          deadline: moment(assignment.submissionDeadline).calendar(moment()),
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

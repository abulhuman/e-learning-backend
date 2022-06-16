import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { PubSub } from 'graphql-subscriptions'
import { CourseService } from 'src/course/course.service'
import { NotificationType } from 'src/graphql'
import { MailService } from 'src/mail/mail.service'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { ClassCourseNotification } from './dto/class-course-notification.dto'
import { CourseNotification } from './dto/course-notification.dto'
import { CreateNotificationInput } from './dto/create-notification.input'
import { UpdateNotificationInput } from './dto/update-notification.input'
import { Notification } from './entities/notification.entity'
import { TelegramNotificationService } from './telegram-notification.service'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private telegramNotificationService: TelegramNotificationService,
    private usersService: UsersService,
    private courseService: CourseService,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
    private mailService: MailService,
  ) {}

  async create(createNotificationInput: CreateNotificationInput) {
    const { recipientId } = createNotificationInput
    delete createNotificationInput.recipientId
    let newNotification = await this.notificationRepository.create(
      createNotificationInput,
    )
    newNotification.recipient = await this.usersService.findOneUserById(
      recipientId,
    )
    newNotification = await this.notificationRepository.save(newNotification)
    return this.dispatch(newNotification)
  }

  async findAll() {
    return await this.notificationRepository.find({
      relations: ['recipient'],
    })
  }

  findOne(id: string) {
    return this.notificationRepository.findOne(id)
  }

  async update(id: string, updateNotificationInput: UpdateNotificationInput) {
    const notificationToUpdate = await this.findOne(id)
    if (!notificationToUpdate)
      throw new NotFoundException(`Notification with id: ${id} was not found.`)
    Object.assign(notificationToUpdate, updateNotificationInput)
    return this.notificationRepository.save(notificationToUpdate)
  }

  async remove(id: string) {
    const notificationToRemove = await this.findOne(id)
    if (!notificationToRemove)
      throw new NotFoundException(`Notification with id: ${id} was not found.`)
    return this.notificationRepository.remove(notificationToRemove)
  }
  async dispatch(notification: Notification) {
    let newNotification
    switch (notification.type) {
      case NotificationType.COURSE_ADDITION: {
        const courseId: string = JSON.parse(notification.data).courseId
        newNotification = {
          ...notification,
          course: await this.courseService.findOneCourse(courseId),
        } as CourseNotification
        this.mailService.sendCourseAdditionEmail(newNotification)
        this.telegramNotificationService.sendCourseAdditionNotification(
          newNotification,
        )
        break
      }
      case NotificationType.TEACHER_COURSE_ASSIGNMENT: {
        const courseId: string = JSON.parse(notification.data).courseId
        newNotification = {
          ...notification,
          course: await this.courseService.findOneCourse(courseId),
        } as CourseNotification
        this.mailService.sendTeacherCourseAssignment(newNotification)
        break
      }
      case NotificationType.COURSE_CLASS_ADDITION: {
        const newNotification = {
          ...notification,
          ...JSON.parse(notification.data),
        } as ClassCourseNotification

        this.mailService.sendClassCourseAssignment(newNotification)
        this.telegramNotificationService.sendCourseAdditionNotification(
          newNotification,
        )
        break
      }
    }
    this.pubSub.publish('pushNotification', [newNotification])
    return newNotification
  }
}

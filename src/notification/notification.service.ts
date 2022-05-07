import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { CreateNotificationInput } from './dto/create-notification.input'
import { UpdateNotificationInput } from './dto/update-notification.input'
import { Notification } from './entities/notification.entity'
import { PubSub } from 'graphql-subscriptions'
import { NotificationType } from 'src/graphql'
import { CourseAdditionNotification } from './dto/course-addition-notification.dto'
import { Course } from 'src/course/entities/course.entity'
import { MailService } from 'src/mail/mail.service'
import { ModuleRef } from '@nestjs/core'

@Injectable()
export class NotificationService implements OnModuleInit {
  private mailService: MailService
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private usersService: UsersService,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
    private moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.mailService = this.moduleRef.get(MailService, { strict: false })
  }

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
      case NotificationType.COURSE_ADDITION:
        newNotification = {
          ...notification,
          course: JSON.parse(notification.data) as Course,
        } as CourseAdditionNotification
        await this.mailService.sendCourseAdditionEmail(newNotification)
    }
    this.pubSub.publish('pushNotification', [newNotification])
    return newNotification
  }
}

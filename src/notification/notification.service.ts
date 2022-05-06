import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { CreateNotificationInput } from './dto/create-notification.input'
import { UpdateNotificationInput } from './dto/update-notification.input'
import { Notification } from './entities/notification.entity'
import { PubSub } from 'graphql-subscriptions'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private usersService: UsersService,
    @Inject('PUB_SUB')
    private pubSub: PubSub,
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

    this.pubSub.publish('pushNotification', [newNotification])

    return newNotification
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
}

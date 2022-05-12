import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql'
import { NotificationService } from './notification.service'
import { CreateNotificationInput } from './dto/create-notification.input'
import { UpdateNotificationInput } from './dto/update-notification.input'
import { Inject, ParseUUIDPipe } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { Notification } from './entities/notification.entity'
import { NotificationStatus } from 'src/graphql'

@Resolver('Notification')
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    @Inject('PUB_SUB') private pubSub: PubSub,
  ) {}

  @Mutation('createNotification')
  create(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.create(createNotificationInput)
  }

  @Query('notifications')
  async findAll() {
    return await this.notificationService.findAll()
  }

  @Query('notification')
  findOne(@Args('id') id: string) {
    return this.notificationService.findOne(id)
  }

  @Mutation('updateNotification')
  update(
    @Args('updateNotificationInput')
    updateNotificationInput: UpdateNotificationInput,
  ) {
    return this.notificationService.update(
      updateNotificationInput.id,
      updateNotificationInput,
    )
  }

  @Mutation('removeNotification')
  remove(@Args('id') id: string) {
    return this.notificationService.remove(id)
  }

  @Subscription('onSubscribe', {
    async resolve(payload, variables) {
      return payload.filter(
        (notification: Notification) =>
          notification.recipient.id === variables.recipientId &&
          notification.status !== NotificationStatus.READ,
      )
    },
  })
  // @Param _recipientId will be required when sending email notifications
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubscribe(@Args('recipientId', ParseUUIDPipe) _recipientId: string) {
    return this.pubSub.asyncIterator('pushNotification')
  }
}

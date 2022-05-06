import { forwardRef, Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationResolver } from './notification.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from './entities/notification.entity'
import { User } from 'src/users/entities/user.entity'
import { UsersModule } from 'src/users/users.module'
import { PubSub } from 'graphql-subscriptions'
@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User, Notification]),
  ],
  providers: [
    NotificationResolver,
    NotificationService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
})
export class NotificationModule {}

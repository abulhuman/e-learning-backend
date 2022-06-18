import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PubSub } from 'graphql-subscriptions'
import { MailModule } from 'src/mail/mail.module'
import { User } from 'src/users/entities/user.entity'
import { UsersModule } from 'src/users/users.module'
import { TelegramModule } from 'src/telegram/telegram.module'
import { Notification } from './entities/notification.entity'
import { NotificationResolver } from './notification.resolver'
import { NotificationService } from './notification.service'
import { TelegramNotificationService } from './telegram-notification.service'
import { CourseModule } from 'src/course/course.module'
@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User, Notification]),
    MailModule,
    TelegramModule,
    CourseModule,
  ],
  providers: [
    NotificationResolver,
    NotificationService,
    TelegramNotificationService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

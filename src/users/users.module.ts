import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PubSub } from 'graphql-subscriptions'
import { AuthModule } from 'src/auth/auth.module'
import { Notification } from 'src/notification/entities/notification.entity'
import { NotificationModule } from 'src/notification/notification.module'
import { NotificationService } from 'src/notification/notification.service'
import { Role } from './entities/role.entity'
import { StudentClass } from './entities/student-class.entity'
import { User } from './entities/user.entity'
import {
  RoleResolver,
  StudentClassResolver,
  UserResolver,
} from './users.resolver'
import { UsersService } from './users.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, StudentClass, Notification]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    UserResolver,
    RoleResolver,
    StudentClassResolver,
    UsersService,
    NotificationService,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

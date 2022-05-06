import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserResolver, RoleResolver } from './users.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'
import { AuthModule } from 'src/auth/auth.module'
import { Notification } from 'src/notification/entities/notification.entity'
import { NotificationModule } from 'src/notification/notification.module'
import { NotificationService } from 'src/notification/notification.service'
import { PubSub } from 'graphql-subscriptions'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Notification]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [
    UserResolver,
    RoleResolver,
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

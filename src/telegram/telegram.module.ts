import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppModule } from 'src/app.module'
import { AssignmentModule } from 'src/assignment/assignment.module'
import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { CourseModule } from 'src/course/course.module'
import { UsersModule } from 'src/users/users.module'
import { dispatchers } from './dispatchers'
import { TelegramAccount } from './entities/telegram-account.entity'
import { handlers } from './handlers'
import { TelegramResolver } from './telegram.resolver'
import { TelegramService } from './telegram.service'

@Module({
  providers: [TelegramService, TelegramResolver, ...dispatchers, ...handlers],
  imports: [
    TypeOrmModule.forFeature([TelegramAccount, AssignmentDefinition]),
    forwardRef(() => AppModule),
    HttpModule,
    ConfigModule,
    forwardRef(() => CourseModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AssignmentModule),
  ],
  exports: [TelegramService],
})
export class TelegramModule {}

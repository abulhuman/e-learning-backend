import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { PassportModule } from '@nestjs/passport'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GraphQLUpload } from 'graphql-upload'
import * as Joi from 'joi'
import { join } from 'node:path'
import appConfigValidation from './app.config'
import { AppService } from './app/app.service'
import authConfigValidation from './auth/auth.config'
import { AuthModule } from './auth/auth.module'
import { Session } from './auth/entities/session.entity'
import { CourseModule } from './course/course.module'
import { databaseConfigValidation } from './database/database.config'
import { DatabaseModule } from './database/database.module'
import emailConfigValidation from './mail/mail.config'
import { MailModule } from './mail/mail.module'
import { NotificationModule } from './notification/notification.module'
import { telegramConfigValidation } from './telegram/telegram.config'
import { TelegramModule } from './telegram/telegram.module'
import { UsersModule } from './users/users.module'
import { QuizModule } from './quiz/quiz.module'
import { AssignmentModule } from './assignment/assignment.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ...appConfigValidation,
        ...authConfigValidation,
        ...databaseConfigValidation,
        ...emailConfigValidation,
        ...telegramConfigValidation,
      }),
      expandVariables: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        playground: configService.get('NODE_ENV') !== 'production',
        typePaths: ['./**/*.graphql'],
        definitions: {
          path: join(process.cwd(), 'src/graphql.ts'),
        },
        emitTypenameField: true,
        installSubscriptionHandlers: true,
        resolvers: { Upload: GraphQLUpload },
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CourseModule,
    TypeOrmModule.forFeature([Session]),
    PassportModule.register({
      session: true,
    }),
    MailModule,
    TelegramModule,
    NotificationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'upload'),
      serveRoot: '/upload',
    }),
    QuizModule,
    AssignmentModule,
    ScheduleModule.forRoot(),
  ],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}

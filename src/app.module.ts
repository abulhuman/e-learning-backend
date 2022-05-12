import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PassportModule } from '@nestjs/passport'
import { GraphQLUpload } from 'graphql-upload'
import * as Joi from 'joi'
import { join } from 'node:path'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { Session } from './auth/entities/session.entity'
import { CourseModule } from './course/course.module'
import { MailModule } from './mail/mail.module'
import appConfigValidation from './app.config'
import authConfigValidation from './auth/auth.config'
import { databaseConfigValidation } from './database/database.config'
import { NotificationModule } from './notification/notification.module'
import { FilesController } from './files/files.controller'

import emailConfigValidation from './mail/mail.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ...appConfigValidation,
        ...authConfigValidation,
        ...databaseConfigValidation,
        ...emailConfigValidation,
      }),
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
    NotificationModule,
  ],
  controllers: [FilesController],
})
export class AppModule {}

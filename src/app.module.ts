import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import * as Joi from 'joi'
import { join } from 'node:path'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Session } from './auth/entities/session.entity'
import { PassportModule } from '@nestjs/passport'
import { FilesModule } from './files/files.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').optional(),
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().required(),
        SESSION_SECRET: Joi.string().required(),
        COOKIE_MAX_AGE: Joi.number().default(4.32e7),
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
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TypeOrmModule.forFeature([Session]),
    PassportModule.register({
      session: true,
    }),
    FilesModule,
  ],
})
export class AppModule {}

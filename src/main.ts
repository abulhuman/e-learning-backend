import { ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { getRepository } from 'typeorm'
import helmet from 'helmet'
import { AppModule } from './app.module'
import * as session from 'express-session'
import { Session } from './auth/entities/session.entity'
import { TypeormStore } from 'connect-typeorm/out'
import * as passport from 'passport'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.select(ConfigModule).get(ConfigService)
  const sessionRepository = getRepository(Session)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.use(helmet())
  app.use(
    session({
      name: 'sessionId',
      secret: configService.get('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: configService.get('NODE_ENV') === 'production',
        maxAge: configService.get('COOKIE_MAX_AGE'),
      },
      store: new TypeormStore({}).connect(sessionRepository),
    }),
  )
  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(configService.get('PORT') || 5050)
}
bootstrap()

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { graphqlUploadExpress } from 'graphql-upload'
import { getRepository } from 'typeorm'
import helmet from 'helmet'
import { AppModule } from './app.module'
import * as session from 'express-session'
import { Session } from './auth/entities/session.entity'
import { TypeormStore } from 'connect-typeorm/out'
import * as passport from 'passport'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

async function bootstrap() {
  const uploadPath = join(__dirname, '/upload')
  existsSync(uploadPath) || mkdirSync(uploadPath)
  const app = await NestFactory.create(AppModule, { cors: true })
  const configService = app.select(ConfigModule).get(ConfigService)
  const sessionRepository = getRepository(Session)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [
            `'self'`,
            `'unsafe-inline'`,
            'cdn.jsdelivr.net',
            'fonts.googleapis.com',
          ],
          fontSrc: [`'self'`, 'fonts.gstatic.com'],
          imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
        },
      },
    }),
  )
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
  app.use(graphqlUploadExpress())
  await app.listen(configService.get('PORT') || 5050)
}
bootstrap()

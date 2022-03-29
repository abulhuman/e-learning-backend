import { ConfigModule, ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.select(ConfigModule).get(ConfigService)
  app.use(helmet({
    contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      fontSrc: [`'self'`, 'fonts.gstatic.com'],
      imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`, `cdn.jsdelivr.net`],
    },
  }))
  await app.listen(configService.get('PORT') || 5050)
}
bootstrap()

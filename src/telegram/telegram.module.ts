import { HttpModule } from '@nestjs/axios'
import { forwardRef, Logger, Module, OnModuleInit } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { timer } from 'rxjs'
import { AppModule } from 'src/app.module'
import { AppService } from 'src/app/app.service'
import { TelegramUser } from './entities/telegram-user.entity'
import { TelegramService } from './telegram.service'

@Module({
  providers: [TelegramService],
  imports: [
    TypeOrmModule.forFeature([TelegramUser]),
    forwardRef(() => AppModule),
    HttpModule,
    ConfigModule,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}

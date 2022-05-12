import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppModule } from 'src/app.module'
import { TelegramAccount } from './entities/telegram-account.entity'
import { TelegramResolver } from './telegram.resolver'
import { TelegramService } from './telegram.service'

@Module({
  providers: [TelegramService, TelegramResolver],
  imports: [
    TypeOrmModule.forFeature([TelegramAccount]),
    forwardRef(() => AppModule),
    HttpModule,
    ConfigModule,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}

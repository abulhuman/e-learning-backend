import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './database.config'

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRoot(databaseConfig)],
})
export class DatabaseModule {}

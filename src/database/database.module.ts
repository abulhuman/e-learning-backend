import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        extra:
          configService.get('NODE_ENV') === 'production'
            ? {
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : undefined,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import * as Joi from 'joi'
import * as dotenv from 'dotenv'
dotenv.config()

export const databaseConfigValidation = {
  DATABASE_URL: Joi.string().required(),
}

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  migrationsRun: true,
  cli: { migrationsDir: 'src/database/migrations' },
  extra:
    process.env.NODE_ENV === 'production'
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : undefined,
}
export default databaseConfig

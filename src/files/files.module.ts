import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { FileUploadController } from './files.controller'

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './upload',
      }),
    }),
  ],
  controllers: [FileUploadController],
})
export class FilesModule {}

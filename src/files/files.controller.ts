import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Express } from 'express'
import { diskStorage } from 'multer'
import { documentFileFilter, editFileName } from './utils/multer-utils'

@Controller('files')
export class FileUploadController {
  @UseInterceptors(
    FileInterceptor('upload', {
      storage: diskStorage({
        destination: 'upload',
        filename: editFileName,
      }),
      fileFilter: documentFileFilter,
    }),
  )
  @Post('upload')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('No document was attached / uploaded.')
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    }
    return response
  }

  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res) {
    return res.sendFile(filename, { root: 'upload' })
  }
}

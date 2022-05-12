import { Controller, Get, Param, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('files')
export class FilesController {
  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: 'dist/upload' })
  }
}

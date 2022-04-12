import { BadRequestException } from '@nestjs/common'
import { extname } from 'node:path'

export const editFileName = (_req, file, callback) => {
  const name = file.originalname.split('.')[0]
  const fileExtName = extname(file.originalname)
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('')
  callback(null, `${name}-${randomName}${fileExtName}`)
}

export const documentFileFilter = (_req: never, file, callback) => {
  if (!file.originalname.match(/.*\.(pdf|doc|docx|ppt|pptx)$/gim)) {
    return callback(
      new BadRequestException(
        'Only one of these document formats (pdf, doc, docx, ppt, pptx) are allowed.',
      ),
      false,
    )
  }
  callback(null, true)
}

import { BadRequestException } from '@nestjs/common'
import { extname } from 'node:path'

export const editFileName = (fileName: string) => {
  const name = fileName.split('.').slice(0, -1).join('')
  const fileExtName = extname(fileName)
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('')

  return `${name}-${randomName}${fileExtName}`
}

export const documentFileFilter = (fileName: string) => {
  const fileExtName = extname(fileName)
  const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip']
  if (!allowedExtensions.includes(fileExtName.slice(1))) {
    throw new BadRequestException(
      'Only one of these document formats (pdf, doc, docx, ppt, pptx, zip) are allowed.',
    )
  }
  // optional guard
  if (!fileName.match(/.*\.(pdf|doc|docx|ppt|pptx|zip)$/gim))
    throw new BadRequestException(
      'Only one of these document formats (pdf, doc, docx, ppt, pptx, zip) are allowed.',
    )
  return true
}

export const spreadSheetFileFilter = (fileName: string) => {
  const fileExtName = extname(fileName)
  const allowedExtensions = ['xlsx', 'csv']
  if (!allowedExtensions.includes(fileExtName.slice(1))) {
    throw new BadRequestException(
      'Only one of these document formats (xlsx, csv) are allowed.',
    )
  }
  // optional guard
  if (!fileName.match(/.*\.(xlsx|csv)$/gim))
    throw new BadRequestException(
      'Only one of these document formats (xlsx, csv) are allowed.',
    )
  return true
}

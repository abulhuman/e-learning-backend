import { CreateSubChapterInput } from './create-sub-chapter.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateSubChapterInput extends PartialType(CreateSubChapterInput) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

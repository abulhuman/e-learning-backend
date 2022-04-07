import { CreateChapterInput } from './create-chapter.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateChapterInput extends PartialType(CreateChapterInput) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

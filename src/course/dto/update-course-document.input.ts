import { CreateCourseDocumentInput } from './create-course-document.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateCourseDocumentInput extends PartialType(
  CreateCourseDocumentInput,
) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

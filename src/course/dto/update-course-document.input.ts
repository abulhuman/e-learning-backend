import { CreateCourseDocumentInput } from './create-course-document.input'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateCourseDocumentInput extends PartialType(
  CreateCourseDocumentInput,
) {
  id: string
}

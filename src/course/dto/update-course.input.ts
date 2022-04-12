import { CreateCourseInput } from './create-course.input'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  id: string
}

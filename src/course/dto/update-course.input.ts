import { CreateCourseInput } from './create-course.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

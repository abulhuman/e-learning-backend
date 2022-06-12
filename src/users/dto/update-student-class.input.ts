import { CreateStudentClassInput } from './create-student-class.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsUUID } from 'class-validator'

export class UpdateStudentClassInput extends PartialType(
  CreateStudentClassInput,
) {
  @IsUUID()
  id: string
}

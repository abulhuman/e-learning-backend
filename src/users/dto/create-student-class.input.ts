import { IsNotEmpty, IsString } from 'class-validator'
import { StudentClass } from '../entities/student-class.entity'

export class CreateStudentClassInput extends StudentClass {
  @IsNotEmpty()
  @IsString()
  year: string

  @IsNotEmpty()
  @IsString()
  section: string
}

import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { StudentClass } from '../entities/student-class.entity'
import { CreateStudentClassInput as ICreateStudentClassInput } from 'src/graphql'

export class CreateStudentClassInput
  extends StudentClass
  implements ICreateStudentClassInput
{
  @IsNotEmpty()
  @IsString()
  year: string

  @IsNotEmpty()
  @IsString()
  section: string

  @IsNotEmpty()
  @IsUUID()
  departmentId: string
}

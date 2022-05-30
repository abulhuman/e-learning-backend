import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { CreateCourseInput as ICreateCourseInput } from 'src/graphql'

export class CreateCourseInput implements ICreateCourseInput {
  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  overview: string

  @IsNotEmpty()
  description: string

  @IsNotEmpty()
  creditHour: number

  @IsUUID()
  @IsNotEmpty()
  departmentId: string
}

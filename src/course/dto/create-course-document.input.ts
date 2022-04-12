import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator'
import { CreateCourseDocumentInput as ICreateCourseDocumentInput } from 'src/graphql'

export class CreateCourseDocumentInput implements ICreateCourseDocumentInput {
  @IsNotEmpty()
  @IsString()
  documentType: string

  @IsNotEmpty()
  @IsString()
  documentName: string

  @IsNotEmpty()
  @IsUrl()
  documentURL: string

  @IsNotEmpty()
  @IsUUID()
  courseId: string
}

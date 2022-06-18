import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import {
  CreateCourseDocumentInput as ICreateCourseDocumentInput,
  Upload,
} from 'src/graphql'

export class CreateCourseDocumentInput implements ICreateCourseDocumentInput {
  @IsNotEmpty()
  @IsString()
  documentType: string

  @IsNotEmpty()
  @IsString()
  documentDisplayName: string

  @IsNotEmpty()
  fileUpload: Upload

  @IsOptional()
  @IsUUID()
  courseId?: string

  @IsOptional()
  @IsUUID()
  chapterId?: string
}

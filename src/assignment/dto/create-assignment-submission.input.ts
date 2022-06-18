import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator'
import { FileUpload } from 'graphql-upload'
import { CreateAssignmentSubmissionInput as ICreateAssignmentSubmissionInput } from 'src/graphql'

export class CreateAssignmentSubmissionInput
  implements ICreateAssignmentSubmissionInput
{
  @IsNotEmpty()
  @IsDateString()
  submissionDate: Date

  @IsNotEmpty()
  file: Promise<FileUpload>

  @IsNotEmpty()
  @IsUUID()
  studentId: string

  @IsNotEmpty()
  @IsUUID()
  definitionId: string
}

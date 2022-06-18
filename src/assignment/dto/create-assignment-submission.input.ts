import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateAssignmentSubmissionInput as ICreateAssignmentSubmissionInput } from 'src/graphql'

export class CreateAssignmentSubmissionInput
  implements ICreateAssignmentSubmissionInput
{
  @IsNotEmpty()
  @IsDateString()
  submissionDate: Date

  @IsNotEmpty()
  @IsUUID()
  submissionFileId: string

  @IsNotEmpty()
  @IsUUID()
  studentId: string

  @IsNotEmpty()
  @IsUUID()
  definitionId: string

  @IsNotEmpty()
  // @IsOptional()
  replaceFile: boolean
}

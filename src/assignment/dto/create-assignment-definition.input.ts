import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateAssignmentDefinitionInput as ICreateAssignmentDefinitionInput } from 'src/graphql'

export class CreateAssignmentDefinitionInput
  implements ICreateAssignmentDefinitionInput
{
  @IsNotEmpty()
  @IsDateString()
  submissionDeadline: Date

  @IsNotEmpty()
  @IsUUID()
  instructionsFileId: string

  @IsNotEmpty()
  @IsUUID()
  courseId: string
}

import { CreateAssignmentSubmissionInput } from './create-assignment-submission.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'
import { Exclude } from 'class-transformer'
import { UpdateAssignmentSubmissionInput as IUpdateAssignmentSubmissionInput } from 'src/graphql'

export class UpdateAssignmentSubmissionInput
  extends PartialType(CreateAssignmentSubmissionInput)
  implements IUpdateAssignmentSubmissionInput
{
  @IsNotEmpty()
  @IsUUID()
  id: string

  @Exclude()
  definitionId?: string

  @IsNumber()
  totalScore: number
}

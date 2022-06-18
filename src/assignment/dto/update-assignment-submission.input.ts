import { CreateAssignmentSubmissionInput } from './create-assignment-submission.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'
import { Exclude } from 'class-transformer'

export class UpdateAssignmentSubmissionInput extends PartialType(
  CreateAssignmentSubmissionInput,
) {
  @IsNotEmpty()
  @IsUUID()
  id: string

  @Exclude()
  definitionId?: string
}

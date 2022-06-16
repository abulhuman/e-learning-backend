import { CreateAssignmentCriterionInput } from './create-assignment-criterion.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateAssignmentCriterionInput extends PartialType(
  CreateAssignmentCriterionInput,
) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

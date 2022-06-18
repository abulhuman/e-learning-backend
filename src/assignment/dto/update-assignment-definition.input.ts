import { CreateAssignmentDefinitionInput } from './create-assignment-definition.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateAssignmentDefinitionInput extends PartialType(
  CreateAssignmentDefinitionInput,
) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

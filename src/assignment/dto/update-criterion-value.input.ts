import { CreateCriterionValueInput } from './create-criterion-value.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateCriterionValueInput extends PartialType(
  CreateCriterionValueInput,
) {
  @IsNotEmpty()
  @IsUUID()
  id: string
}

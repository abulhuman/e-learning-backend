import {
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { CreateAssignmentCriterionInput as ICreateAssignmentCriterionInput } from 'src/graphql'

export class CreateAssignmentCriterionInput
  implements ICreateAssignmentCriterionInput
{
  @IsNotEmpty()
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNotEmpty()
  @IsDecimal()
  @IsNumber()
  weight: number

  @IsNotEmpty()
  @IsUUID()
  definitionId: string
}

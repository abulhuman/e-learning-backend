import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator'
import { CreateCriterionValueInput as ICreateCriterionValueInput } from 'src/graphql'

export class CreateCriterionValueInput implements ICreateCriterionValueInput {
  @IsNotEmpty()
  @IsNumber()
  score: number

  @IsNotEmpty()
  @IsUUID()
  criterionId: string

  @IsNotEmpty()
  @IsUUID()
  submissionId: string
}

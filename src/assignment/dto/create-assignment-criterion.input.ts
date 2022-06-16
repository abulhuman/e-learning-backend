import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator'
import { CreateAssignmentCriterionInput as ICreateAssignmentCriterionInput } from 'src/graphql'

export class CreateAssignmentCriterionInput
  implements ICreateAssignmentCriterionInput
{
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(20)
  weight: number

  @IsNotEmpty()
  @IsUUID()
  definitionId: string
}

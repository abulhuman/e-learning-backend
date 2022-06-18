import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
} from 'class-validator'
import { CreateAssignmentDefinitionInput as ICreateAssignmentDefinitionInput } from 'src/graphql'

export class CreateAssignmentDefinitionInput
  implements ICreateAssignmentDefinitionInput
{
  @IsNotEmpty()
  @IsNumber()
  maximumScore: number

  @IsNotEmpty()
  @IsBoolean()
  isCriteriaBased?: boolean = false

  @IsNotEmpty()
  @IsDateString()
  submissionDeadline: Date

  @IsNotEmpty()
  @IsUUID()
  instructionsFileId: string

  @IsNotEmpty()
  @IsUUID()
  courseId: string

  @IsNotEmpty()
  name: string
}

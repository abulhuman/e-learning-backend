import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
} from 'class-validator'
import { FileUpload } from 'graphql-upload'
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
  instructionsFile: Promise<FileUpload>

  @IsNotEmpty()
  @IsUUID()
  courseId: string

  @IsNotEmpty()
  name: string
}

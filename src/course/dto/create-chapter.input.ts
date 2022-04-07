import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { CreateChapterInput as ICreateChapterInput } from 'src/graphql'

export class CreateChapterInput implements ICreateChapterInput {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsInt()
  sequenceNumber: number

  @IsNotEmpty()
  @IsUUID()
  courseId: string
}

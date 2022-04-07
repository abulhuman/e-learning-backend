import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { CreateSubChapterInput as ICreateSubChapterInput } from 'src/graphql'

export class CreateSubChapterInput implements ICreateSubChapterInput {
  @IsNotEmpty()
  @IsString()
  title: string

  @IsNotEmpty()
  @IsInt()
  sequenceNumber: number

  @IsNotEmpty()
  @IsUUID()
  chapterId: string
}

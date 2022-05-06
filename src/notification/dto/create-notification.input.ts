import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { CreateNotificationInput as ICreateNotificationInput } from 'src/graphql'

export class CreateNotificationInput implements ICreateNotificationInput {
  @IsNotEmpty()
  @IsString()
  text: string

  @IsNotEmpty()
  @IsUUID()
  recipientId: string
}

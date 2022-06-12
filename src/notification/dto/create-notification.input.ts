import { IsJSON, IsNotEmpty, IsUUID } from 'class-validator'
import {
  CreateNotificationInput as ICreateNotificationInput,
  NotificationType,
} from 'src/graphql'

export class CreateNotificationInput implements ICreateNotificationInput {
  @IsNotEmpty()
  @IsJSON()
  data: string

  @IsNotEmpty()
  type: NotificationType

  @IsNotEmpty()
  @IsUUID()
  recipientId: string
}

import {
  NotificationStatus,
  UpdateNotificationInput as IUpdateNotificationInput,
} from 'src/graphql'
import { CreateNotificationInput } from './create-notification.input'
import { PartialType } from '@nestjs/mapped-types'
import { IsEnum, IsUUID } from 'class-validator'
import { Exclude } from 'class-transformer'

export class UpdateNotificationInput
  extends PartialType(CreateNotificationInput)
  implements IUpdateNotificationInput
{
  @IsUUID()
  id: string

  @Exclude()
  recipientId?: string

  @IsEnum(NotificationStatus)
  status?: NotificationStatus
}

import { IsUUID } from 'class-validator'

import { UUIDArrayDto as IUUIDArrayDto } from 'src/graphql'

export class UUIDArrayDto implements IUUIDArrayDto {
  @IsUUID('4', { each: true })
  ids: string[]
}

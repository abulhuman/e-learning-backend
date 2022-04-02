import { CreateUserInput } from './create-user.input'
import { PartialType } from '@nestjs/mapped-types'
import { RoleName } from 'src/graphql'
import { IsUUID, IsEnum } from 'class-validator'

export class UpdateUserInput extends PartialType(CreateUserInput) {
  @IsUUID()
  id: string

  @IsEnum(RoleName)
  roleName?: RoleName
}

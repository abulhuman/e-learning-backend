import { CreateUserInput } from './create-user.input'
import { PartialType } from '@nestjs/mapped-types'
import { RoleName } from 'src/graphql'

export class UpdateUserInput extends PartialType(CreateUserInput) {
  id: string
  roleName?: RoleName
}

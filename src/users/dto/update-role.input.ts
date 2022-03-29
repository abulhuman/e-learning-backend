import { CreateRoleInput } from './create-role.input'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  id: string
}

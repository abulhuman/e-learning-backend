import { RoleName } from './../../graphql'
import { Role } from '../entities/role.entity'
import { IsNotEmpty, IsEnum } from 'class-validator'

export class CreateRoleInput extends Role {
  constructor(name: RoleName) {
    super()
    this.name = name
  }

  @IsNotEmpty()
  @IsEnum(RoleName)
  name: RoleName
}

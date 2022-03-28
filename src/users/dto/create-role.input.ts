import { RoleName } from './../../graphql'
import { Role } from '../entities/role.entity'

export class CreateRoleInput extends Role {
  constructor(name: RoleName) {
    super()
    this.name = name
  }
  name: RoleName
}

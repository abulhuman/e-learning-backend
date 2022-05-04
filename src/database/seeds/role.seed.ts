import { RoleName } from 'src/graphql'
import { Role } from 'src/users/entities/role.entity'

export const ADMIN_ROLE_SEED: Partial<Role> = {
  name: RoleName.ADMINISTRATOR,
}

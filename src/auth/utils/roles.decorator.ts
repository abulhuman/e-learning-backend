import { SetMetadata } from '@nestjs/common'
import { RoleName } from 'src/graphql'

export const ROLES_KEY = 'ROLES'
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles)

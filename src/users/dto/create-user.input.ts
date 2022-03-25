import { RoleName } from 'src/graphql'
import { User } from '../entities/user.entity'

export class CreateUserInput extends User {
  fisrtName: string
  middleName: string
  lastName: string
  roleName: RoleName
}

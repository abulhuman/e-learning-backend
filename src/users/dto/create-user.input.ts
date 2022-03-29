import { IsEmail, IsNotEmpty } from 'class-validator'
import { RoleName } from 'src/graphql'
import { User } from '../entities/user.entity'

export class CreateUserInput extends User {
  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  middleName: string

  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  roleName: RoleName

  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}

import { IsAlpha, IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { User } from '../entities/user.entity'

export class UserEntry
  implements
    Pick<User, 'firstName' | 'lastName' | 'middleName' | 'email' | 'password'>
{
  @IsNotEmpty()
  @IsAlpha()
  firstName: string
  @IsNotEmpty()
  @IsAlpha()
  lastName: string
  @IsNotEmpty()
  @IsAlpha()
  middleName: string
  @IsNotEmpty()
  @IsEmail()
  email: string

  @MinLength(8)
  password: string
}

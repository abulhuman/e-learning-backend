import {
  IsEmail,
  IsNotEmpty,
  IsAlpha,
  IsString,
  IsEnum,
  Length,
} from 'class-validator'
import { RoleName } from 'src/graphql'
import { User } from '../entities/user.entity'

export class CreateUserInput extends User {
  @IsNotEmpty()
  @IsAlpha()
  firstName: string

  @IsNotEmpty()
  @IsAlpha()
  middleName: string

  @IsNotEmpty()
  @IsAlpha()
  lastName: string

  @IsNotEmpty()
  @IsEnum(RoleName)
  roleName: RoleName

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @Length(8, 12)
  password: string
}

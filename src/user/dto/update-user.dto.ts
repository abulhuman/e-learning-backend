import { OmitType, PartialType } from '@nestjs/mapped-types'
import { User } from '../entities/user.entity'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(
  OmitType(User, ['password'] as const),
) {}

import { User } from 'src/user/entities/user.entity'
import { Request } from 'express'

export interface RequestWithUser extends Request {
  user: User
}

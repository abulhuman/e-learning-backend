import { Inject } from '@nestjs/common'
import { PassportSerializer } from '@nestjs/passport'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

export class SessionSerialzer extends PassportSerializer {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super()
  }
  serializeUser(user: User, done: (err, userId: string) => void) {
    done(null, user.id)
  }
  async deserializeUser(userId: string, done: (err, user: User) => void) {
    const userDB = await this.usersService.findById(userId)
    return userDB ? done(null, userDB) : done(null, null)
  }
}

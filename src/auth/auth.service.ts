import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneUserByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }
}

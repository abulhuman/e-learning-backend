import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }
}

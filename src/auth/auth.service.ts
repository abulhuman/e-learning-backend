import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }
  register(createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }
}

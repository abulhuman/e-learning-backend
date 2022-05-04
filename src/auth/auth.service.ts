import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { MailService } from 'src/mail/mail.service'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneUserByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }
  async sendVerificationLink(user: User) {
    const payload = { id: user.id }
    const token = this.jwtService.sign(payload)
    const name = [user.firstName, user.lastName].join(' ')
    await this.mailService.sendVerificationEmail(user.email, token, name)
  }
}

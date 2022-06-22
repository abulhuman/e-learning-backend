import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { MailService } from 'src/mail/mail.service'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name)
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private mailService: MailService,
  ) {}
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneUserByEmail(email)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }
  async sendVerificationLink(user: Partial<User>, password: string) {
    const name = [user.firstName, user.lastName].join(' ')
    try {
      await this.mailService.sendVerificationEmail(user.email, name, password)
    } catch (error) {
      this.logger.error(error)
    }
  }
}

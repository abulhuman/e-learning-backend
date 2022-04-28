import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async sendVerificationEmail(email: string, token: string, name: string) {
    const url = `${this.configService.get(
      'EMAIL_VERIFICATION_URL',
    )}?token=${token}`
    return this.mailerService.sendMail({
      to: email,
      subject: 'Verify Account Email',
      template: '/verification',
      context: {
        url,
        name,
      },
    })
  }
}

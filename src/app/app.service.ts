import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  public get isInProduction() {
    return this.configService.get('NODE_ENV') === 'production'
  }

  public get appUrl() {
    return this.configService.get('HEROKU_URL')
  }
}

import {
  Controller,
  Get,
  Post,
  Request,
  Session,
  UseGuards,
} from '@nestjs/common'
import { AuthenticatedGuard, LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'

@Controller('auth')
export class AuthController {
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Session() session: Record<string, any>) {
    session.authenticated = true
    return session
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user
  }
}

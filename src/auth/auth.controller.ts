import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'

@Controller('auth')
export class AuthController {
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Request() req: RequestWithUser) {
    return req.user
  }

  @UseGuards(LocalAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user
  }
}

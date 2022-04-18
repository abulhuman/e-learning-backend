import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  Session,
  UseGuards,
} from '@nestjs/common'
import { Session as ExpressSession } from 'express-session'
import { AuthenticatedGuard, LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'

@Controller('auth')
export class AuthController {
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Request() req: RequestWithUser) {
    const { roles: rawRoles } = req.user
    const roles = rawRoles.map(role => role.name)
    return {
      ...req.user,
      roles,
    }
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user
  }

  @UseGuards(AuthenticatedGuard)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  signout(@Session() session: ExpressSession, @Request() req: RequestWithUser) {
    try {
      req.logOut()
      session.cookie.maxAge = 0
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}

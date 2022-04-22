import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  Response,
  Session,
  UseGuards,
} from '@nestjs/common'
import { Session as ExpressSession } from 'express-session'
import { promisify } from 'util'
import { AuthenticatedGuard, LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'
import { Response as ExpressResponse } from 'express'

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

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(
    @Request() req: RequestWithUser,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      req.logOut()
      await promisify(req.session.destroy.bind(req.session))()
      res.clearCookie('sessionId')
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}

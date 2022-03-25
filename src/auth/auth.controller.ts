import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from 'src/user/dto/create-user.dto'
import { QueryFailedExceptionFilter } from '../database/filters/query-failed-exception.filter'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Request() req: RequestWithUser) {
    return req.user
  }
  @UseFilters(QueryFailedExceptionFilter)
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @UseGuards(LocalAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return
  }
}

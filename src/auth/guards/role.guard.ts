import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { RoleName } from 'src/graphql'
import { UsersService } from 'src/users/users.service'
import { RequestWithUser } from '../interfaces/request-with-user.interface'
import { ROLES_KEY } from '../utils/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UsersService,
  ) {}

  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const context = GqlExecutionContext.create(executionContext)
    const requiredRoles = this.reflector.getAllAndMerge<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }
    const { user } = context.switchToHttp().getRequest<RequestWithUser>()
    const roles = await this.userService.getRoles(user.id)
    return requiredRoles.some(role =>
      roles.map(role => role.name).includes(role),
    )
  }
}

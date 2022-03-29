import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User as UserEntity } from 'src/users/entities/user.entity'

export const UserParam = createParamDecorator(function (
  data: unknown,
  ctx: ExecutionContext,
): UserEntity {
  const context = GqlExecutionContext.create(ctx).getContext()
  return context.req.user
})

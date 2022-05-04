import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserResolver, RoleResolver } from './users.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserResolver, RoleResolver, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

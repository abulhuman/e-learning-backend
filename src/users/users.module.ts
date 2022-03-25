import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UserResolver, RoleResolver } from './users.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Role } from './entities/role.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [UserResolver, RoleResolver, UsersService],
})
export class UsersModule {}

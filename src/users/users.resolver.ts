import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql'
import { UsersService } from './users.service'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateUserInput } from './dto/update-user.input'
import { CreateRoleInput } from './dto/create-role.input'
import { Role } from './entities/role.entity'
import { User } from './entities/user.entity'
import { RoleName } from 'src/graphql'

@Resolver('User')
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation('createUser')
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput)
  }

  @Query('users')
  findAllUsers() {
    return this.usersService.findAllUsers()
  }

  @Query('user')
  findOneUser(@Args('id') id: string) {
    return this.usersService.findOneUser(id)
  }

  @Mutation('updateUser')
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.updateUser(updateUserInput.id, updateUserInput)
  }

  @Mutation('removeUser')
  removeUser(@Args('id') id: string) {
    return this.usersService.removeUser(id)
  }

  @ResolveField('roles')
  roles(@Parent() user: User) {
    return user.roles
  }
}

@Resolver('Role')
export class RoleResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation('createRole')
  createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    return this.usersService.createRole(createRoleInput)
  }

  @Query('roles')
  findAllRoles() {
    return this.usersService.findAllRoles()
  }

  @Query('role')
  findOneRole(@Args('id') id: string) {
    return this.usersService.findOneRole(id)
  }

  @Mutation('revokeUserRole')
  revokeUserRole(
    @Args('userId') userId: string,
    @Args('roleName') roleName: RoleName,
  ) {
    return this.usersService.revokeUserRole(userId, roleName)
  }

  @ResolveField('members')
  owner(@Parent() role: Role) {
    return role.members
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RoleName } from 'src/graphql'
import { Repository } from 'typeorm'
import { CreateRoleInput } from './dto/create-role.input'
import { CreateUserInput } from './dto/create-user.input'
import { UpdateRoleInput } from './dto/update-role.input'
import { UpdateUserInput } from './dto/update-user.input'
import { Role } from './entities/role.entity'
import { User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}
  async createUser(createUserInput: CreateUserInput) {
    let newUser = new User(
      createUserInput.firstName,
      createUserInput.middleName,
      createUserInput.lastName,
    )

    let userRole = await this.roleRepository.findOne({
      where: { name: createUserInput.roleName },
    })

    if (!userRole) {
      const newRoleInput = new CreateRoleInput(createUserInput.roleName)
      userRole = await this.createRole(newRoleInput)
    }

    newUser.roles = [userRole]

    newUser = this.userRepository.create(createUserInput)

    return this.userRepository.save(newUser)
  }

  async findAllUsers() {
    return this.userRepository.find({ relations: ['roles'] })
  }

  findOneUser(id: string) {
    return this.userRepository.findOne(id, { relations: ['roles'] })
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput) {
    const userToUpdate = await this.findOneUser(id)

    if (!userToUpdate)
      throw new NotFoundException(
        `User with id ${updateUserInput.id} was not found.`,
      )

    Object.assign(userToUpdate, updateUserInput)

    // Check if user already has the provided Role
    // In order to avoid redundant roles on a single user
    const userAlreadyHasRole = userToUpdate.roles
      .map(role => role.name)
      .includes(updateUserInput.roleName)

    if (userAlreadyHasRole)
      throw new ConflictException(
        `User already has ${updateUserInput.roleName} role.`,
      )

    if (updateUserInput.roleName) {
      let roleToAssign = await this.findOneRole(
        undefined,
        updateUserInput.roleName,
      )

      if (!roleToAssign) {
        roleToAssign = await this.createRole(
          new CreateRoleInput(updateUserInput.roleName),
        )
      }

      userToUpdate.roles.push(roleToAssign)
    }

    return this.userRepository.save(userToUpdate)
  }

  async removeUser(id: string) {
    const userToDelete = await this.findOneUser(id)

    return this.userRepository.remove(userToDelete)
  }

  // Role services
  async createRole(createRoleInput: CreateRoleInput) {
    const newRole = this.roleRepository.create(createRoleInput)

    return this.roleRepository.save(newRole)
  }

  findAllRoles() {
    return this.roleRepository.find({ relations: ['members'] })
  }

  findOneRole(id?: string, roleName?: RoleName) {
    return this.roleRepository.findOne(id, {
      relations: ['members'],
      where: { name: roleName },
    })
  }

  async updateRole(id: string, updateRoleInput: UpdateRoleInput) {
    const roleToUpdate = await this.findOneRole(id)

    Object.assign(roleToUpdate, updateRoleInput)

    return this.roleRepository.save(roleToUpdate)
  }

  async removeRole(id: string) {
    const roleToDelete = await this.findOneRole(id)

    return this.roleRepository.remove(roleToDelete)
  }

  async revokeUserRole(userId: string, roleName: RoleName) {
    const user = await this.findOneUser(userId)

    if (!user) throw new NotFoundException(`User with id ${userId} not found.`)

    const userAlreadyHasRole = user.roles
      .map(role => role.name)
      .includes(roleName)

    if (!userAlreadyHasRole)
      throw new NotFoundException(
        `User role ${roleName} was not found on User with id ${userId}.`,
      )

    const roleToRevoke = await this.findOneRole(undefined, roleName)

    if (!roleToRevoke)
      throw new NotFoundException(`Role with name ${roleName} was not found.`)

    user.roles = user.roles.filter(role => role.name !== roleToRevoke.name)

    return this.userRepository.save(user)
  }
}

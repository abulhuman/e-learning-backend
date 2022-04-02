import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { RoleName } from 'src/graphql'
import { Repository } from 'typeorm'
import { CreateRoleInput } from './dto/create-role.input'
import { CreateUserInput } from './dto/create-user.input'
import { FindUserDto } from './dto/find-user.dto'
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
    createUserInput.password = await bcrypt.hash(createUserInput.password, 10)
    const { roleName, ...rest } = createUserInput

    let userRole = await this.roleRepository.findOne({
      where: { name: roleName },
    })

    if (!userRole) {
      const newRoleInput = new CreateRoleInput(createUserInput.roleName)
      userRole = await this.createRole(newRoleInput)
    }

    const newUser = this.userRepository.create(rest)
    newUser.roles = [userRole]

    return this.userRepository.save(newUser)
  }

  async findAllUsers() {
    return this.userRepository.find({ relations: ['roles'] })
  }

  findOneUserById(id: string): Promise<User> {
    return this.findOne({ id })
  }

  findOneUserByEmail(email: string): Promise<User> {
    return this.findOne({ email })
  }

  async getRoles(id: string): Promise<Role[]> {
    const userWithRoles = await this.findOne({ id }, true)
    return userWithRoles.roles
  }

  private findOne(findUserDto: FindUserDto, withRoles = false): Promise<User> {
    return this.userRepository.findOne(findUserDto, {
      relations: withRoles ? ['roles'] : undefined,
    })
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput) {
    const userToUpdate = await this.findOneUserById(id)

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
    const userToDelete = await this.findOneUserById(id)
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
    const user = await this.findOneUserById(userId)

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
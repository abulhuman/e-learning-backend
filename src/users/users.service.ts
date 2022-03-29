import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
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
    const allUsers = await this.userRepository.find({ relations: ['roles'] })
    return allUsers
  }

  findById(id: string): Promise<User> {
    return this.findOne({ id })
  }

  findByEmail(email: string): Promise<User> {
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
    const userToUpdate = await this.findById(id)

    Object.assign(userToUpdate, updateUserInput)
    return this.userRepository.save(userToUpdate)
  }

  async removeUser(id: string) {
    const userToDelete = await this.findById(id)
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

  findOneRole(id: string) {
    return this.roleRepository.findOne(id, { relations: ['members'] })
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
}

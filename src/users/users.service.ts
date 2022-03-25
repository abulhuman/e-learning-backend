import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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
    const allUsers = await this.userRepository.find({ relations: ['roles'] })

    console.log({ allUsers })
    return allUsers

    // return this.userRepository.find({ relations: ['roles'] })
  }

  findOneUser(id: string) {
    return this.userRepository.findOne(id, { relations: ['roles'] })
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput) {
    const userToUpdate = await this.findOneUser(id)

    Object.assign(userToUpdate, updateUserInput)

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

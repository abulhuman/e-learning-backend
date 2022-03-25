import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { PostgresErrorCode } from 'src/database/postgres-error-codes.enum'
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { FindUserDto } from './dto/find-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10)
      const newUser = this.usersRepository.create(createUserDto)
      return this.usersRepository.save(newUser)
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException(
          `User with email "${createUserDto.email}" already exists`,
        )
      }
      throw new HttpException(
        { message: error?.message, error },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  findById(id: string): Promise<User> {
    return this.findOne({ id })
  }

  findByUsername(username: string): Promise<User> {
    return this.findOne({ username })
  }

  findByEmail(email: string): Promise<User> {
    return this.findOne({ email })
  }

  private findOne(findUserDto: FindUserDto): Promise<User> {
    return this.usersRepository.findOne(findUserDto)
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}

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
import { ParseUUIDPipe, UseFilters } from '@nestjs/common'
import { QueryFailedExceptionFilter } from 'src/database/filters/query-failed-exception.filter'
import { RoleName } from 'src/graphql'
import { NotificationService } from 'src/notification/notification.service'
import { UpdateStudentClassInput } from './dto/update-student-class.input'
import { StudentClass } from './entities/student-class.entity'
import { CreateStudentClassInput } from './dto/create-student-class.input'
import { UUIDArrayDto } from 'src/app/dto/uuid-array.dto'

@Resolver('User')
export class UserResolver {
  constructor(
    private readonly usersService: UsersService,
    private notificationService: NotificationService,
  ) {}

  @UseFilters(QueryFailedExceptionFilter)
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
    return this.usersService.findOneUserById(id)
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

  @ResolveField('notifications')
  async notifications(@Parent() user: User) {
    return (await this.usersService.findOneUserById(user.id, true, true))
      .notifications
  }

  @ResolveField('attendingClass')
  async attendingClass(@Parent() user: User) {
    return (await this.usersService.findOneUserById(user.id, true, false, true))
      .attendingClass
  }

  @ResolveField('learningClasses')
  async learningClasses(@Parent() user: User) {
    return (
      await this.usersService.findOneUserById(user.id, true, false, false, true)
    ).learningClasses
  }
}

@Resolver('StudentClass')
export class StudentClassResolver {
  constructor(private readonly usersService: UsersService) {}
  @Mutation('createStudentClass')
  createStudentClass(
    @Args('createStudentClassInput')
    createStudentClassInput: CreateStudentClassInput,
  ) {
    return this.usersService.createStudentClass(createStudentClassInput)
  }

  @Query('studentClass')
  findOneStudentClass(@Args('id') id: string) {
    return this.usersService.findOneStudentClass(id)
  }

  @Query('studentClasses')
  findStudentClasses() {
    return this.usersService.findAllStudentClasses()
  }

  @Mutation('updateStudentClass')
  updateStudentClass(
    @Args('updateStudentClassInput')
    updateStudentClassInput: UpdateStudentClassInput,
  ): Promise<StudentClass> {
    return this.usersService.updateStudentClass(updateStudentClassInput)
  }

  @Mutation('admitStudentToClass')
  admitStudentToClass(
    @Args('studentId', ParseUUIDPipe) studentId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.admitStudentToClass(studentId, classId)
  }

  @Mutation('admitStudentsToClass')
  admitStudentsToClass(
    @Args('studentIds')
    _studentIds: UUIDArrayDto,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    const studentIds = _studentIds.ids
    return this.usersService.admitStudentsToClass(studentIds, classId)
  }

  @Mutation('assignTeacherToClass')
  assignTeacherToClass(
    @Args('teacherId', ParseUUIDPipe) teacherId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.assignTeacherToClass(teacherId, classId)
  }

  @Mutation('promoteStudentFromClass')
  promoteStudentFromClass(
    @Args('studentId', ParseUUIDPipe) studentId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.promoteStudentFromClass(studentId, classId)
  }

  @Mutation('promoteStudentsFromClass')
  promoteStudentsFromClass(
    @Args('studentIds')
    _studentIds: UUIDArrayDto,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    const studentIds = _studentIds.ids
    return this.usersService.promoteStudentsFromClass(studentIds, classId)
  }

  @Mutation('dismissTeacherFromClass')
  dismissTeacherFromClass(
    @Args('teacherId', ParseUUIDPipe) teacherId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.dismissTeacherFromClass(teacherId, classId)
  }

  @ResolveField('students')
  async students(@Parent() studentClass: StudentClass) {
    return (await this.usersService.findOneStudentClass(studentClass.id))
      .students
  }

  @ResolveField('teachers')
  async teachers(@Parent() studentClass: StudentClass) {
    return (await this.usersService.findOneStudentClass(studentClass.id))
      .teachers
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

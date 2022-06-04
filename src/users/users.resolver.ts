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
import {
  InternalServerErrorException,
  Logger,
  ParseBoolPipe,
  ParseUUIDPipe,
  UseFilters,
} from '@nestjs/common'
import { QueryFailedExceptionFilter } from 'src/database/filters/query-failed-exception.filter'
import { CreateMultipleUsersInput, RoleName } from 'src/graphql'
import { NotificationService } from 'src/notification/notification.service'
import { UpdateStudentClassInput } from './dto/update-student-class.input'
import { StudentClass } from './entities/student-class.entity'
import { CreateStudentClassInput } from './dto/create-student-class.input'
import { UUIDArrayDto } from 'src/app/dto/uuid-array.dto'
import { Department } from './entities/department.entity'
import { FileUpload } from 'graphql-upload'
import arrayifyStream from 'arrayify-stream'
import { spreadSheetFileFilter } from 'src/files/utils/file-upload.utils'

@Resolver('User')
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name)
  constructor(
    private readonly usersService: UsersService,
    private notificationService: NotificationService,
  ) {}

  @UseFilters(QueryFailedExceptionFilter)
  @Mutation('createUser')
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput)
  }

  @Mutation('createMultipleUsers')
  async createMultipleUsers(@Args('input') input: CreateMultipleUsersInput) {
    const { file } = input
    const { createReadStream, filename }: FileUpload = await file
    spreadSheetFileFilter(filename)
    const readStream = createReadStream()
    const fileBuffer = await arrayifyStream(readStream)
    const users = this.usersService.parseWorkbook(fileBuffer[0], input)
    return this.usersService.createMany(users, input.roleName)
  }

  @Query('users')
  findAllUsers() {
    return this.usersService.findAllUsers()
  }

  @Query('getAllStudentsByClassId')
  async getAllStudentsByClassId(
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.findAllStudentsByClassId(classId)
  }

  @Query('getAllNewDepartmentAdministrators')
  async getAllNewDepartmentAdministrators() {
    const allUsers = await this.usersService.findAllUsers()
    const allDepartmentAdministrators = allUsers.map(user => {
      const userRoles = user.roles.map(role => role.name)
      if (userRoles.includes(RoleName.DEPARTMENT_ADMINSTRATOR)) return user
    })
    const allNewDepartmentAdministrators = allDepartmentAdministrators
      .filter(user => !user?.department)
      .filter(admin => !!admin)
    return allNewDepartmentAdministrators
  }

  @Query('user')
  findOneUser(@Args('id') id: string) {
    return this.usersService.findOneUserById(
      id,
      true,
      false,
      false,
      false,
      true,
    )
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

  @ResolveField('department')
  async department(@Parent() user: User) {
    return (
      await this.usersService.findOneUserById(
        user.id,
        true,
        false,
        false,
        false,
        true,
      )
    ).department
  }

  @ResolveField('assignmentSubmissions')
  async assignmentSubmissions(@Parent() user: User) {
    return (
      await this.usersService.findOneUserById(
        user.id,
        true,
        false,
        false,
        false,
        false,
        true,
      )
    ).assignmentSubmissions
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

  @Mutation('deleteStudentClass')
  deleteStudentClass(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('removeStudents', ParseBoolPipe) removeStudents,
  ): boolean | Promise<boolean> {
    return this.usersService.deleteStudentClass(id, removeStudents)
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

  @ResolveField('department')
  async department(@Parent() studentClass: StudentClass) {
    return (await this.usersService.findOneStudentClass(studentClass.id))
      .department
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
  findOneRole(@Args('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneRole({ id }, ['members'])
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

@Resolver('Department')
export class DepartmentResolver {
  constructor(private readonly usersService: UsersService) {}
  @Mutation('createDepartment')
  createDepartment(@Args('name') name: string) {
    return this.usersService.createDepartment(name)
  }
  @Query('department')
  findOneDepartment(@Args('id') id: string) {
    return this.usersService.findOneDepartment(id)
  }

  @Query('departments')
  findStudentClasses() {
    return this.usersService.findAllDepartments()
  }

  @Mutation('updateDepartment')
  updateDepartment(
    @Args('id', ParseUUIDPipe)
    id: string,
    @Args('name') name: string,
  ): Promise<Department> {
    return this.usersService.updateDepartment(id, name)
  }

  @Mutation('removeDepartment')
  removeDepartment(
    @Args('id', ParseUUIDPipe)
    id: string,
  ): Promise<boolean> {
    return this.usersService.removeDepartment(id)
  }

  @Mutation('addClassToDepartment')
  addClassToDepartment(
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.addClassToDepartment(departmentId, classId)
  }

  @Mutation('removeClassFromDepartment')
  removeClassFromDepartment(
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.usersService.removeClassFromDepartment(departmentId, classId)
  }

  @Mutation('appointDepartmentAdministrator')
  appointDepartmentAdministrator(
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
    @Args('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.appointDepartmentAdministrator(
      departmentId,
      userId,
    )
  }

  @Mutation('dismissDepartmentAdministrator')
  dismissDepartmentAdministrator(
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
    @Args('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.usersService.dismissDepartmentAdministrator(
      departmentId,
      userId,
    )
  }

  @ResolveField('classes')
  async classes(@Parent() department: Department) {
    return (await this.usersService.findOneDepartment(department.id)).classes
  }

  @ResolveField('departmentAdministrator')
  async departmentAdministrator(@Parent() department: Department) {
    return (await this.usersService.findOneDepartment(department.id))
      .departmentAdministrator
  }
}

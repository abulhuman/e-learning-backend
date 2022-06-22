import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { validateSync } from 'class-validator'
import { AuthService } from 'src/auth/auth.service'
import { CreateMultipleUsersInput, RoleName } from 'src/graphql'
import { FindConditions, Repository } from 'typeorm'
import { read, utils } from 'xlsx'
import { CreateRoleInput } from './dto/create-role.input'
import { CreateStudentClassInput } from './dto/create-student-class.input'
import { CreateUserInput } from './dto/create-user.input'
import { FindUserDto } from './dto/find-user.dto'
import { UpdateStudentClassInput } from './dto/update-student-class.input'
import { UpdateUserInput } from './dto/update-user.input'
import { UserEntry } from './dto/user-entry.dto'
import { Department } from './entities/department.entity'
import { Role } from './entities/role.entity'
import { StudentClass } from './entities/student-class.entity'
import { User } from './entities/user.entity'
import { generate } from 'randomstring'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(StudentClass)
    private studentClassRepository: Repository<StudentClass>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async createUser(createUserInput: CreateUserInput) {
    const { password } = createUserInput
    createUserInput.password = await bcrypt.hash(createUserInput.password, 10)
    const { roleName, ...rest } = createUserInput

    let roleToAssign = await this.findOneRole({ name: roleName })

    if (!roleToAssign) {
      const newRoleInput = new CreateRoleInput(createUserInput.roleName)
      roleToAssign = await this.createRole(newRoleInput)
    }

    const newUser = this.userRepository.create(rest)
    newUser.roles = [roleToAssign]
    await this.authService.sendVerificationLink(newUser, password)
    return this.userRepository.save(newUser)
  }
  async createMany(users: Partial<User>[], roleName: RoleName) {
    let roleToAssign = await this.findOneRole({ name: roleName })
    if (!roleToAssign) {
      roleToAssign = await this.createRole(new CreateRoleInput(roleName))
    }

    const usersToSave = users.map(user => {
      user.roles = [roleToAssign]
      user.password = bcrypt.hashSync(user.password, 10)
      return user
    })

    users.forEach(user =>
      this.authService.sendVerificationLink(user, user.password),
    )

    return this.userRepository.save(usersToSave).then(users => users.length + 1)
  }

  async findAllUsers() {
    return this.userRepository.find({
      relations: ['roles', 'notifications', 'attendingClass', 'department'],
    })
  }

  async findOneUserById(
    id: string,
    withRoles = true,
    withNotifications = false,
    withAttendingClass = false,
    withTeachingClasses = false,
    withDepartment = false,
    withSubmissions = false,
    withTeachingCourses = false,
    withAttendingCourses = false,
    withOwnedCourses = false,
  ): Promise<User> {
    const user = await this.findOne(
      { id },
      withRoles,
      withNotifications,
      withAttendingClass,
      withTeachingClasses,
      withDepartment,
      withSubmissions,
      withTeachingCourses,
      withAttendingCourses,
      withOwnedCourses,
    )
    if (!user) throw new NotFoundException(`User with id: ${id} was not found.`)
    return user
  }

  findOneUserByEmail(email: string, withRoles = true): Promise<User> {
    const user = this.findOne({ email }, withRoles)
    return user
  }

  async findAllStudentsByClassId(classId: string) {
    const studentClass = await this.findOneStudentClass(classId)
    if (!studentClass)
      throw new NotFoundException(`Class with id: ${classId} was not found.`)

    const allUsers = await this.findAllUsers()

    const studentUsers = allUsers.filter(user => {
      const userRoles = user.roles.map(role => role.name)
      return userRoles.includes(RoleName.STUDENT)
    })
    const studentsInClass = studentUsers.filter(
      student => student.attendingClass?.id === classId,
    )
    return studentsInClass
  }

  async getRoles(id: string): Promise<Role[]> {
    const userWithRoles = await this.findOne({ id }, true)
    return userWithRoles.roles
  }

  private findOne(
    findUserDto: FindUserDto,
    withRoles = false,
    withNotifications = false,
    withAttendingClass = false,
    withTeachingClasses = false,
    withDepartment = false,
    withSubmissions = false,
    withTeachingCourses = false,
    withAttendingCourses = false,
    withOwnedCourses = false,
  ): Promise<User> {
    const relations = []
    if (withRoles) relations.push('roles')
    if (withNotifications) relations.push('notifications')
    if (withAttendingClass) relations.push('attendingClass')
    if (withTeachingClasses) relations.push('teachingClasses')
    if (withDepartment) relations.push('department')
    if (withSubmissions) relations.push('assignmentSubmissions')
    if (withTeachingCourses) relations.push('teachingCourses')
    if (withAttendingCourses) relations.push('attendingCourses')
    if (withOwnedCourses) relations.push('ownedCourses')
    return this.userRepository.findOne(findUserDto, {
      relations,
    })
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput) {
    const userToUpdate = await this.findOneUserById(id)

    if (!userToUpdate)
      throw new NotFoundException(
        `User with id ${updateUserInput.id} was not found.`,
      )

    updateUserInput.password = updateUserInput.password
      ? await bcrypt.hash(updateUserInput.password, 10)
      : undefined

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
      let roleToAssign = await this.findOneRole({
        name: updateUserInput.roleName,
      })

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

  findOneRole(options: FindConditions<Role>, relations?: string[]) {
    return this.roleRepository.findOne(options, {
      relations,
    })
  }

  async removeRole(id: string) {
    const roleToDelete = await this.findOneRole({ id })

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

    const roleToRevoke = await this.findOneRole({ name: roleName })

    if (!roleToRevoke)
      throw new NotFoundException(`Role with name ${roleName} was not found.`)

    user.roles = user.roles.filter(role => role.name !== roleToRevoke.name)

    return this.userRepository.save(user)
  }

  // StudentClass services
  async createStudentClass(createStudentClassInput: CreateStudentClassInput) {
    const newStudentClass = this.studentClassRepository.create(
      createStudentClassInput,
    )
    const { departmentId } = createStudentClassInput
    delete createStudentClassInput.departmentId
    const department = await this.findOneDepartment(departmentId)
    Object.assign(newStudentClass, { department })
    return this.studentClassRepository.save(newStudentClass)
  }
  async findOneStudentClass(id: string) {
    const studentClass = await this.studentClassRepository.findOne(id, {
      relations: [
        'students',
        'students.courses',
        'teachers',
        'teachers.roles',
        'department',
        'attendingCourses',
      ],
    })
    if (!studentClass)
      throw new NotFoundException(`Class with id: ${id} was not found.`)
    return studentClass
  }

  async findAllStudentClasses() {
    return this.studentClassRepository.find()
  }

  async updateStudentClass(updateStudentClassInput: UpdateStudentClassInput) {
    const studentClassToUpdate = await this.findOneStudentClass(
      updateStudentClassInput.id,
    )
    if (!studentClassToUpdate)
      throw new NotFoundException(
        `Class with id": ${updateStudentClassInput.id} was not found.`,
      )
    Object.assign(studentClassToUpdate, updateStudentClassInput)
    return this.studentClassRepository.save(studentClassToUpdate)
  }
  async admitStudentToClass(
    studentId: string,
    classId: string,
  ): Promise<boolean> {
    const studentUser = await this.findOneUserById(studentId, true)
    if (!studentUser)
      throw new NotFoundException(`No user found with id: ${studentId}.`)
    if (
      !studentUser.roles
        .map(roleEntity => roleEntity.name)
        .includes(RoleName.STUDENT)
    )
      throw new BadRequestException(
        `The user with id: ${studentId} is not a student user.`,
      )
    if (studentUser.attendingClass)
      throw new BadRequestException(
        `This student is already admitted in the class: (Year: ${studentUser.attendingClass.year}, Section: ${studentUser.attendingClass.section}).`,
      )

    const studentClass = await this.findOneStudentClass(classId)
    if (!studentClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)

    if (!studentClass.students?.length) studentClass.students = []
    studentClass.students.push(studentUser)

    this.studentClassRepository.save(studentClass)

    return true
  }
  async admitStudentsToClass(
    studentIds: string[],
    classId: string,
  ): Promise<boolean> {
    studentIds.forEach(async (studentId: string) => {
      this.admitStudentToClass(studentId, classId)
    })
    return true
  }
  async assignTeacherToClass(
    teacherId: string,
    classId: string,
  ): Promise<boolean> {
    const teacherUser = await this.findOneUserById(teacherId, true)
    if (!teacherUser)
      throw new NotFoundException(`No user found with id: ${teacherId}.`)
    const userRoles = teacherUser.roles.map(roleEntity => roleEntity.name)

    const isNotTeacher = !userRoles.includes(RoleName.TEACHER)
    if (isNotTeacher)
      throw new BadRequestException(
        `The user with id: ${teacherId} is not a teacher user.`,
      )

    const teacherClass = await this.findOneStudentClass(classId)
    if (!teacherClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)

    if (
      teacherUser.teachingClasses
        ?.map(studentClass => studentClass.id)
        ?.includes(classId)
    )
      throw new BadRequestException(
        `This teacher is already assigned to the class: (Year: ${teacherClass.year}, Section: ${teacherClass.section}).`,
      )
    if (!teacherUser.teachingClasses) teacherUser.teachingClasses = []
    if (!teacherClass.teachers) teacherClass.teachers = []

    teacherUser.teachingClasses.push(teacherClass)
    teacherClass.teachers.push(teacherUser)

    await this.userRepository.save(teacherUser)
    await this.studentClassRepository.save(teacherClass)
    return true
  }
  async promoteStudentFromClass(
    studentId: string,
    classId: string,
  ): Promise<boolean> {
    const studentUser = await this.findOneUserById(studentId, true, false, true)
    if (!studentUser)
      throw new NotFoundException(`No user found with id: ${studentId}.`)
    if (
      !studentUser.roles
        .map(roleEntity => roleEntity.name)
        .includes(RoleName.STUDENT)
    )
      throw new BadRequestException(
        `The user with id: ${studentId} is not a student user.`,
      )
    const studentClass = await this.findOneStudentClass(classId)

    if (!studentClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)

    if (studentUser.attendingClass.id !== classId)
      throw new BadRequestException(
        `This student is not admitted in the class: (Year: ${studentClass.year}, Section: ${studentClass.section}).`,
      )
    studentUser.attendingClass = null
    this.userRepository.save(studentUser)
    return true
  }
  async promoteStudentsFromClass(
    studentIds: string[],
    classId: string,
  ): Promise<boolean> {
    studentIds.forEach(studentId =>
      this.promoteStudentFromClass(studentId, classId),
    )
    return true
  }
  async dismissTeacherFromClass(
    teacherId: string,
    classId: string,
  ): Promise<boolean> {
    const teacherUser = await this.findOneUserById(
      teacherId,
      true,
      false,
      false,
      true,
    )
    if (!teacherUser)
      throw new NotFoundException(`No user found with id: ${teacherId}.`)
    const userRoles = teacherUser.roles.map(roleEntity => roleEntity.name)
    const isNotTeacher = !userRoles.includes(RoleName.TEACHER)
    if (isNotTeacher)
      throw new BadRequestException(
        `The user with id: ${teacherId} is not a teacher user.`,
      )
    const teacherClass = await this.findOneStudentClass(classId)

    if (!teacherClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)
    const learningClassIds = teacherUser.teachingClasses.map(
      learningClass => learningClass.id,
    )
    if (!learningClassIds.find(learningClassId => learningClassId === classId))
      throw new BadRequestException(
        `This teacher is not assigned to the class: (Year: ${teacherClass.year}, Section: ${teacherClass.section}).`,
      )
    const classIndex = learningClassIds.indexOf(classId)
    teacherUser.teachingClasses.splice(classIndex, 1)
    this.userRepository.save(teacherUser)
    return true
  }
  async deleteStudentClass(id: string, removeStudents = false) {
    const studentClassToRemove = await this.findOneStudentClass(id)
    if (studentClassToRemove?.students?.length) {
      if (!removeStudents) {
        throw new BadRequestException(`The class is not empty.`)
      }
      studentClassToRemove.students.forEach(student => {
        student.attendingClass = null
        this.userRepository.save(student)
      })
      studentClassToRemove.students = []
    }
    return (
      this.studentClassRepository
        .remove(studentClassToRemove)
        .then(res => !!res)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }

  async createDepartment(name: string) {
    const newDepartment = this.departmentRepository.create({ name })
    return this.departmentRepository.save(newDepartment)
  }
  async findOneDepartment(id: string) {
    const department = await this.departmentRepository.findOne(id, {
      relations: ['classes', 'departmentAdministrator', 'ownedCourses'],
    })
    if (!department)
      throw new NotFoundException(`Department with id": ${id} was not found.`)
    return department
  }
  async findAllDepartments() {
    return this.departmentRepository.find()
  }
  async updateDepartment(id: string, name: string): Promise<Department> {
    const departmentToUpdate = await this.findOneDepartment(id)
    if (!departmentToUpdate)
      throw new NotFoundException(`Department with id": ${id} was not found.`)
    Object.assign(departmentToUpdate, { name })
    return this.departmentRepository.save(departmentToUpdate)
  }
  async removeDepartment(id: string): Promise<boolean> {
    const departmentToDelete = await this.findOneDepartment(id)
    return (
      this.departmentRepository
        .remove(departmentToDelete)
        .then(res => !!res)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
  async addClassToDepartment(departmentId: string, classId: string) {
    const department = await this.findOneDepartment(departmentId)
    if (!department)
      throw new NotFoundException(
        `Department with id": ${departmentId} was not found.`,
      )
    const studentClass = await this.findOneStudentClass(classId)
    if (!studentClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)
    if (!department?.classes?.length) department.classes = []
    const departmentAlreadyHasClass = department.classes.find(
      cl => cl.id === classId,
    )
    if (departmentAlreadyHasClass)
      throw new ConflictException(
        `Class with id": ${classId} was already inside department with id: ${departmentId}.`,
      )
    department.classes.push(studentClass)
    this.departmentRepository.save(department)
    return true
  }
  async removeClassFromDepartment(departmentId: string, classId: string) {
    const department = await this.findOneDepartment(departmentId)
    if (!department)
      throw new NotFoundException(
        `Department with id": ${departmentId} was not found.`,
      )
    const studentClass = await this.findOneStudentClass(classId)
    if (!studentClass)
      throw new NotFoundException(`Class with id": ${classId} was not found.`)
    if (!department?.classes.length) department.classes = []
    const departmentAlreadyHasClass = department.classes.find(
      cl => cl.id === classId,
    )
    if (!departmentAlreadyHasClass)
      throw new ConflictException(
        `Class with id": ${classId} doesn't belong inside department with id: ${departmentId}.`,
      )
    const classesIds = department.classes.map(item => item.id)
    const clsIdx = classesIds.indexOf(classId)
    department.classes.splice(clsIdx, 1)
    // department.classes.slice(studentClass)
    this.departmentRepository.save(department)
    return true
  }
  async appointDepartmentAdministrator(departmentId: string, userId: string) {
    const department = await this.findOneDepartment(departmentId)

    if (!department)
      throw new NotFoundException(
        `Department with id ${departmentId} not found.`,
      )

    if (department?.departmentAdministrator?.id === userId)
      throw new ConflictException(
        `Department has user with id: ${userId} assigned as DEPARTMENT_ADMINISTRATOR.`,
      )
    const user = await this.findOneUserById(userId)

    if (!user) throw new NotFoundException(`User with id ${userId} not found.`)

    const userRoles = user.roles.map(role => role.name)
    const isNotDepartmentAdministrator = !userRoles.includes(
      RoleName.DEPARTMENT_ADMINISTRATOR,
    )

    if (isNotDepartmentAdministrator)
      throw new BadRequestException(
        `The user with id: ${userId} is not a DEPARTMENT_ADMINISTRATOR user.`,
      )

    department.departmentAdministrator = user
    this.departmentRepository.save(department)
    return true
  }
  async dismissDepartmentAdministrator(departmentId: string, userId: string) {
    const department = await this.findOneDepartment(departmentId)

    if (!department)
      throw new NotFoundException(
        `Department with id ${departmentId} not found.`,
      )

    if (!department.departmentAdministrator)
      throw new BadRequestException(
        `Department with id ${departmentId} has no DEPARTMENT_ADMINISTRATOR.`,
      )
    const user = await this.findOneUserById(userId)
    if (!user) throw new NotFoundException(`User with id ${userId} not found.`)

    const userRoles = user.roles.map(role => role.name)
    const isNotDepartmentAdministrator = !userRoles.includes(
      RoleName.DEPARTMENT_ADMINISTRATOR,
    )

    if (isNotDepartmentAdministrator)
      throw new BadRequestException(
        `The user with id: ${userId} is not a DEPARTMENT_ADMINISTRATOR user.`,
      )
    if (department.departmentAdministrator.id !== userId)
      throw new BadRequestException(
        `The user with id: ${userId} is not appointed to the given department.`,
      )
    department.departmentAdministrator = null
    this.departmentRepository.save(department)
    return true
  }

  parseWorkbook(fileBuffer: any[], input: CreateMultipleUsersInput) {
    const REQUIRED_FIELDS = ['firstName', 'middleName', 'lastName', 'email']

    const workbook = read(fileBuffer)

    const users: UserEntry[] = []
    Object.entries(workbook.Sheets).forEach(([sheetName, sheet]) => {
      const usersToImport = utils.sheet_to_json(sheet, {
        header: [...REQUIRED_FIELDS, 'password'],
        defval: undefined,
      })
      usersToImport.forEach((userJSON: Partial<UserEntry>, index) => {
        const newUser = new UserEntry()
        newUser.email = userJSON.email
        newUser.firstName = userJSON.firstName
        newUser.middleName = userJSON.middleName
        newUser.lastName = userJSON.lastName
        if (input.password) {
          newUser.password = input.password
        } else if (!userJSON.password || userJSON.password.length < 8) {
          newUser.password = generate({
            length: 8,
            capitalization: 'uppercase',
          })
        }
        const errors = validateSync(newUser, { stopAtFirstError: true })
        if (errors.length) {
          throw new BadRequestException(
            `Error on row ${index + 1} of sheet ${sheetName}: Invalid entry`,
          )
        }
        users.push(newUser)
      })
    })
    return users
  }

  async counters() {
    const getCount = (role: RoleName) =>
      this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .where('role.name = :role', { role })
        .getCount()
    const allUsers = await this.userRepository.count()
    const students = await getCount(RoleName.STUDENT)
    const teachers = await getCount(RoleName.TEACHER)
    const courseManagers = await getCount(RoleName.COURSE_MANAGER)
    const courseOwners = await getCount(RoleName.COURSE_OWNER)
    const departmentAdministrators = await getCount(
      RoleName.DEPARTMENT_ADMINISTRATOR,
    )
    return {
      allUsers,
      students,
      teachers,
      courseManagers,
      courseOwners,
      departmentAdministrators,
    }
  }
}

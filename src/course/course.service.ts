import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UUIDArrayDto } from 'src/app/dto/uuid-array.dto'
import { RoleName } from 'src/graphql'
import { TelegramAccount } from 'src/telegram/entities/telegram-account.entity'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { CreateChapterInput } from './dto/create-chapter.input'
import { CreateCourseDocumentInput } from './dto/create-course-document.input'
import { CreateCourseInput } from './dto/create-course.input'
import { CreateSubChapterInput } from './dto/create-sub-chapter.input'
import { UpdateChapterInput } from './dto/update-chapter.input'
import { UpdateCourseDocumentInput } from './dto/update-course-document.input'
import { UpdateCourseInput } from './dto/update-course.input'
import { UpdateSubChapterInput } from './dto/update-sub-chapter.input'
import { Chapter } from './entities/chapter.entity'
import { CourseDocument } from './entities/course-document.entity'
import { Course } from './entities/course.entity'
import { SubChapter } from './entities/sub-chapter.entity'

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,

    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,

    @InjectRepository(SubChapter)
    private subChapterRepository: Repository<SubChapter>,

    @InjectRepository(CourseDocument)
    private courseDocumentRepository: Repository<CourseDocument>,

    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(StudentClass)
    private studentClassRepository: Repository<StudentClass>,

    private usersService: UsersService,
  ) {}
  async createOneCourse(createCourseInput: CreateCourseInput) {
    const { departmentId } = createCourseInput
    const newCourse = this.courseRepository.create(createCourseInput)
    const owningDepartment = await this.usersService.findOneDepartment(
      departmentId,
    )
    newCourse.owningDepartment = owningDepartment
    return this.courseRepository.save(newCourse)
  }

  async createOneChapter(createChapterInput: CreateChapterInput) {
    const { courseId } = createChapterInput
    delete createChapterInput.courseId
    const newChapter = this.chapterRepository.create(createChapterInput)
    newChapter.course = await this.findOneCourse(courseId)
    return await this.chapterRepository.save(newChapter)
  }

  async createOneSubChapter(createSubChapterInput: CreateSubChapterInput) {
    const { chapterId } = createSubChapterInput
    delete createSubChapterInput.chapterId
    const newSubChapter = this.subChapterRepository.create(
      createSubChapterInput,
    )
    newSubChapter.chapter = await this.findOneChapter(chapterId)
    return this.subChapterRepository.save(newSubChapter)
  }

  async createOneCourseDocument(
    createCourseDocumentInput: CreateCourseDocumentInput,
    storedFileName: string,
  ) {
    let newCourseDocument: CourseDocument
    delete createCourseDocumentInput.fileUpload
    if (
      !createCourseDocumentInput.courseId &&
      !createCourseDocumentInput.chapterId
    )
      throw new BadRequestException(
        `either \`courseId\` or \`chapterId\` are required on input type CreateCourseDocumentInput`,
      )
    if (createCourseDocumentInput.courseId) {
      const { courseId } = createCourseDocumentInput
      delete createCourseDocumentInput.courseId

      newCourseDocument = this.courseDocumentRepository.create(
        createCourseDocumentInput,
      )
      newCourseDocument.course = await this.findOneCourse(courseId)
    } else {
      const { chapterId } = createCourseDocumentInput
      delete createCourseDocumentInput.chapterId
      newCourseDocument = this.courseDocumentRepository.create(
        createCourseDocumentInput,
      )
      newCourseDocument.chapter = await this.findOneChapter(chapterId)
    }

    newCourseDocument.storedFileName = storedFileName
    return await this.courseDocumentRepository.save(newCourseDocument)
  }

  findAllCourses() {
    return this.courseRepository.find({
      relations: [
        'chapters',
        'chapters.subChapters',
        'chapters.documents',
        'users',
        'users.roles',
        'students',
        'students.roles',
      ],
    })
  }

  findCoursesForUser(userId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.students', 'user')
      .where('user.id = :id', { id: userId })
      .getMany()
  }

  findUsersInCourse(courseId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.students', 'user')
      .where('course.id = :id', { id: courseId })
      .getOne()
      .then(course => course.students)
  }

  findUsersWithAccounts(courseId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.students', 'user')
      .where('course.id = :id', { id: courseId })
      .innerJoinAndSelect(
        TelegramAccount,
        'account',
        'account.userId = user.id',
      )
      .getOne()
      .then(course => course.students)
  }

  findAllChapters() {
    return this.chapterRepository.find({ relations: ['course', 'subChapters'] })
  }

  findChaptersForCourse(courseId: string) {
    return this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoin('chapter.course', 'course')
      .leftJoinAndSelect('chapter.subChapters', 'subChapter')
      .where('course.id = :id', { id: courseId })
      .getMany()
  }

  findAllSubChapters() {
    return this.subChapterRepository.find({ relations: ['chapter'] })
  }

  findAllCourseDocuments() {
    return this.courseDocumentRepository.find({ relations: ['course'] })
  }

  findCourseDocumentsForCourse(courseId: string) {
    return this.courseDocumentRepository
      .createQueryBuilder('courseDocument')
      .leftJoin('courseDocument.course', 'course')
      .where('course.id = :id', { id: courseId })
      .getMany()
  }

  async findOneCourse(id: string) {
    const course = await this.courseRepository.findOne(id, {
      relations: [
        'chapters',
        'chapters.subChapters',
        'students.roles',
        'students',
        'teachers',
        'owner',
        'takingClasses',
        'owningDepartment',
      ],
    })
    if (!course)
      throw new NotFoundException(`Course with id: ${id} was not found.`)
    return course
  }

  findOneChapter(id: string) {
    return this.chapterRepository.findOne(id, {
      relations: ['subChapters', 'documents'],
    })
  }

  findOneSubChapter(id: string) {
    return this.subChapterRepository.findOne(id)
  }

  async findOneCourseDocument(id: string) {
    const courseDocument = await this.courseDocumentRepository.findOne(id, {
      relations: ['assignmentSubmission', 'chapter'],
    })
    if (!courseDocument)
      throw new NotFoundException(
        `Course document with id: ${id} was not found.`,
      )
    return courseDocument
  }

  async updateCourse(id: string, updateCourseInput: UpdateCourseInput) {
    const courseToUpdate = await this.findOneCourse(id)
    Object.assign(courseToUpdate, updateCourseInput)
    return this.courseRepository.save(courseToUpdate)
  }

  async updateChapter(id: string, updateChapterInput: UpdateChapterInput) {
    const chapterToUpdate = await this.findOneChapter(id)
    Object.assign(chapterToUpdate, updateChapterInput)
    return this.chapterRepository.save(chapterToUpdate)
  }

  async updateSubChapter(
    id: string,
    updateSubChapterInput: UpdateSubChapterInput,
  ) {
    const subChapterToUpdate = await this.findOneSubChapter(id)
    Object.assign(subChapterToUpdate, updateSubChapterInput)
    return this.subChapterRepository.save(subChapterToUpdate)
  }

  async updateCourseDocument(
    id: string,
    updateCourseDocumentInput: UpdateCourseDocumentInput,
  ) {
    const courseDocumentToUpdate = await this.findOneCourseDocument(id)
    Object.assign(courseDocumentToUpdate, updateCourseDocumentInput)
    return this.courseDocumentRepository.save(courseDocumentToUpdate)
  }

  async removeCourse(id: string) {
    const courseToDelete = await this.findOneCourse(id)
    return (
      this.courseRepository
        .remove(courseToDelete)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }

  async removeChapter(id: string) {
    const chapterToDelete = await this.findOneChapter(id)
    return (
      this.chapterRepository
        .remove(chapterToDelete)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }

  async removeSubChapter(id: string) {
    const subChapterToDelete = await this.findOneSubChapter(id)
    return (
      this.subChapterRepository
        .remove(subChapterToDelete)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }

  async removeCourseDocument(id: string) {
    const courseDocumentToDelete = await this.findOneCourseDocument(id)
    return (
      this.courseDocumentRepository
        .remove(courseDocumentToDelete)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }

  async assignStudentToCourse(
    courseId: any,
    studentId: any,
    nestedCourse: Course = null,
  ) {
    const user = await this.usersService.findOneUserById(
      studentId,
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    )
    const userRoles = user.roles.map(role => role.name)
    if (!userRoles.includes(RoleName.STUDENT))
      throw new BadRequestException(
        `User with id: ${studentId} is not a student.`,
      )
    const course = nestedCourse ?? (await this.findOneCourse(courseId))

    course?.students.push(user)
    if (!user?.attendingCourses) user.attendingCourses = []
    user.attendingCourses.push(course)
    try {
      const updatedCourse = await this.courseRepository.save(course)
      return !!updatedCourse
    } catch (error) {
      return false
    }
  }

  async assignTeacherToCourse(courseId: any, teacherId: any) {
    try {
      const user = await this.usersService.findOneUserById(teacherId, true)
      const userRoles = user.roles.map(role => role.name)
      if (
        !userRoles.includes(RoleName.COURSE_TEACHER) ||
        !userRoles.includes(RoleName.TEACHER)
      )
        throw new BadRequestException(
          `User with id: ${teacherId} is not a teacher.`,
        )
      const course = await this.findOneCourse(courseId)

      course?.teachers.push(user)
      await this.courseRepository.save(course)
    } catch (error) {
      throw error
    }
    return true
  }

  async assignClassToCourse(courseId: string, classId: string) {
    try {
      const course = await this.findOneCourse(courseId)
      const clazz = await this.usersService.findOneStudentClass(classId)
      if (!course?.takingClasses) course.takingClasses = []
      course.takingClasses.push(clazz)

      if (!course?.students) course.students = []
      clazz.students.forEach(student => {
        course.students.push(student)
      })

      const updatedCourse = await this.courseRepository.save(course)
      return !!updatedCourse
    } catch (error) {
      throw error
    }
  }

  async assignClassesToCourses(
    _coursesIds: UUIDArrayDto,
    _classesIds: UUIDArrayDto,
  ) {
    const { ids: coursesIds } = _coursesIds
    const { ids: classesIds } = _classesIds
    coursesIds.forEach(courseId => {
      classesIds.forEach(async classId => {
        try {
          await this.assignClassToCourse(courseId, classId)
        } catch (error) {
          throw error
        }
      })
    })
    return true
  }

  async assignCourseToDepartment(courseId: string, departmentId: string) {
    const course = await this.findOneCourse(courseId)
    const department = await this.usersService.findOneDepartment(departmentId)

    course.owningDepartment = department

    return !!(await this.courseRepository.save(course))
  }

  async assignOwnerToCourse(courseId: string, ownerId: string) {
    const course = await this.findOneCourse(courseId)
    const user = await this.usersService.findOneUserById(ownerId)

    const userRoles = user.roles.map(role => role.name)
    if (!userRoles.includes(RoleName.COURSE_OWNER))
      this.usersService.updateUser(user.id, {
        id: user.id,
        roleName: RoleName.COURSE_OWNER,
      })
    course.owner = user

    return !!(await this.courseRepository.save(course))
  }

  async unassignStudentFromCourse(courseId: string, studentId: string) {
    const _ = false
    const studentToUnassign = await this.usersService.findOneUserById(
      studentId,
      true,
      _,
      _,
      _,
      _,
      _,
      _,
      true,
    )
    const studentRoles = studentToUnassign.roles.map(role => role.name)
    if (!studentRoles.includes(RoleName.STUDENT))
      throw new BadRequestException(
        `User with id: ${studentId} is not a student.`,
      )
    const courseToUpdate = await this.findOneCourse(courseId)

    const studentIsEnrolledToTheCourse = courseToUpdate.students
      .map(student => student.id)
      .includes(studentId)

    if (!studentIsEnrolledToTheCourse)
      throw new BadRequestException(
        `Student with id: (${studentId}) is not currently enrolled in course with id: (${courseId}).`,
      )

    courseToUpdate.students = courseToUpdate.students.filter(
      student => student.id !== studentId,
    )

    const updatedCourse = await this.courseRepository.save(courseToUpdate)

    return !updatedCourse.students.includes(studentToUnassign)
  }

  async unassignTeacherFromCourse(courseId: string, teacherId: string) {
    const _ = false
    const teacherToUnassign = await this.usersService.findOneUserById(
      teacherId,
      true,
      _,
      _,
      _,
      _,
      _,
      true,
      _,
    )
    const teacherRoles = teacherToUnassign.roles.map(role => role.name)
    if (
      !teacherRoles.includes(RoleName.COURSE_TEACHER) ||
      !teacherRoles.includes(RoleName.TEACHER)
    )
      throw new BadRequestException(
        `User with id: ${teacherId} is not a teacher.`,
      )
    const courseToUpdate = await this.findOneCourse(courseId)

    const teacherIsEnrolledToTheCourse = courseToUpdate.teachers
      .map(teacher => teacher.id)
      .includes(teacherId)

    if (!teacherIsEnrolledToTheCourse)
      throw new BadRequestException(
        `teacher with id: (${teacherId}) is not currently enrolled in course with id: (${courseId}).`,
      )

    courseToUpdate.teachers = courseToUpdate.teachers.filter(
      teacher => teacher.id !== teacherId,
    )

    const updatedCourse = await this.courseRepository.save(courseToUpdate)

    return !updatedCourse.teachers.includes(teacherToUnassign)
  }

  async unassignClassFromCourse(courseId: string, classId: string) {
    try {
      const course = await this.findOneCourse(courseId)
      const clazz = await this.usersService.findOneStudentClass(classId)
      if (!course?.takingClasses?.length)
        throw new BadRequestException(
          `This class currently does not take any courses.`,
        )

      course.takingClasses = course.takingClasses.filter(
        clazz => clazz.id !== classId,
      )
      clazz.students.forEach(clazzStudent => {
        course.students = course.students.filter(
          courseStudent => courseStudent.id !== clazzStudent.id,
        )
      })

      const updatedCourse = await this.courseRepository.save(course)
      return !!updatedCourse
    } catch (error) {
      throw error
    }
  }

  async unassignClassesFromCourses(
    _coursesIds: UUIDArrayDto,
    _classesIds: UUIDArrayDto,
  ) {
    const { ids: coursesIds } = _coursesIds
    const { ids: classesIds } = _classesIds
    coursesIds.forEach(courseId => {
      classesIds.forEach(async classId => {
        try {
          await this.unassignClassFromCourse(courseId, classId)
        } catch (error) {
          throw error
        }
      })
    })
    return true
  }

  async unassignCourseFromDepartment(courseId: string, departmentId: string) {
    const course = await this.findOneCourse(courseId)
    const department = await this.usersService.findOneDepartment(departmentId)

    if (course.owningDepartment.id !== department.id)
      throw new BadRequestException(
        `The department with id: ${departmentId} does not own the course with id: ${courseId}.`,
      )

    course.owningDepartment = null

    return !!(await this.courseRepository.save(course))
  }

  async unassignOwnerFromCourse(courseId: string, ownerId: string) {
    const course = await this.findOneCourse(courseId)
    const _ = false
    const user = await this.usersService.findOneUserById(
      ownerId,
      true,
      _,
      _,
      _,
      _,
      _,
      _,
      _,
      true,
    )

    const userRoles = user.roles.map(role => role.name)
    if (!userRoles.includes(RoleName.COURSE_OWNER))
      throw new BadRequestException(
        `User with id: ${ownerId} is not a course owner.`,
      )
    const ownedCourseIDs = user.ownedCourses
      ? user.ownedCourses.map(course => course.id)
      : []
    if (!ownedCourseIDs.includes(course.id))
      throw new BadRequestException(
        `The user with id: ${ownerId} does not own the course with id: ${courseId}.`,
      )
    course.owner = null

    const unassignOwner = this.courseRepository.save(course)
    const revokeRole = this.usersService.revokeUserRole(
      user.id,
      RoleName.COURSE_OWNER,
    )

    return !!(await Promise.all([unassignOwner, revokeRole]))
  }
}

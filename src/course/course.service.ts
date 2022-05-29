import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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
  createOneCourse(createCourseInput: CreateCourseInput) {
    const newCourse = this.courseRepository.create(createCourseInput)
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
    const { courseId } = createCourseDocumentInput
    delete createCourseDocumentInput.courseId
    delete createCourseDocumentInput.fileUpload

    const newCourseDocument = this.courseDocumentRepository.create(
      createCourseDocumentInput,
    )
    newCourseDocument.storedFileName = storedFileName
    newCourseDocument.course = await this.findOneCourse(courseId)
    return await this.courseDocumentRepository.save(newCourseDocument)
  }

  findAllCourses() {
    return this.courseRepository.find({
      relations: ['chapters', 'chapters.subChapters', 'users', 'users.roles'],
    })
  }

  findCoursesForUser(userId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.users', 'user')
      .where('user.id = :id', { id: userId })
      .getMany()
  }

  findUsersInCourse(courseId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.users', 'user')
      .where('course.id = :id', { id: courseId })
      .getOne()
      .then(course => course.users)
  }

  findUsersWithAccounts(courseId: string) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.users', 'user')
      .where('course.id = :id', { id: courseId })
      .innerJoinAndSelect(
        TelegramAccount,
        'account',
        'account.userId = user.id',
      )
      .getOne()
      .then(course => course.users)
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
        'users',
        'users.roles',
        'students',
        'teachers',
        'takingClasses',
      ],
    })
    if (!course)
      throw new NotFoundException(`Course with id: ${id} was not found.`)
    return course
  }

  findOneChapter(id: string) {
    return this.chapterRepository.findOne(id, { relations: ['subChapters'] })
  }

  findOneSubChapter(id: string) {
    return this.subChapterRepository.findOne(id)
  }

  async findOneCourseDocument(id: string) {
    const courseDocument = await this.courseDocumentRepository.findOne(id, {
      relations: ['assignmentSubmission'],
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
    if (!user?.teachingCourses) user.teachingCourses = []
    user.teachingCourses.push(course)
    try {
      this.userRepository.save(user)
      this.courseRepository.save(course)
      return true
    } catch (error) {
      return false
    }
  }

  async assignClassToCourse(courseId: string, classId: string) {
    const course = await this.findOneCourse(courseId)
    const clazz = await this.usersService.findOneStudentClass(classId)
    if (!course?.takingClasses) course.takingClasses = []
    course.takingClasses.push(clazz)
    clazz.attendingCourses.push(course)
    let updatedCourse: Course
    try {
      if (!course?.students) course.students = []
      clazz.students.forEach(student => {
        course.students.push(student)
      })
      console.log(course)

      updatedCourse = await this.courseRepository.save(course)
      return !!updatedCourse
    } catch (error) {
      const { message, detail } = error
      console.log(`error: `, { message, detail })
      return false
    }

    // if (!clazz?.students) clazz.students = []
    // const debug = clazz?.students.forEach(async student => {
    //   const { id } = student
    //   try {
    //     this.assignStudentToCourse(courseId, id, course)
    //     return true
    //   } catch (error) {
    //     return false
    //   }
    // })
    // console.log(debug)

    return true
  }
}

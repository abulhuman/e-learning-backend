import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
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

  findAllChapters() {
    return this.chapterRepository.find({ relations: ['course', 'subChapters'] })
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

  findOneCourse(id: string) {
    return this.courseRepository.findOne(id, {
      relations: ['chapters', 'chapters.subChapters', 'users', 'users.roles'],
    })
  }

  findOneChapter(id: string) {
    return this.chapterRepository.findOne(id, { relations: ['subChapters'] })
  }

  findOneSubChapter(id: string) {
    return this.subChapterRepository.findOne(id)
  }

  async findOneCourseDocument(id: string) {
    const courseDocument = await this.courseDocumentRepository.findOne(id)
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
    return this.courseRepository.remove(courseToDelete)
  }

  async removeChapter(id: string) {
    const chapterToDelete = await this.findOneChapter(id)
    return this.chapterRepository.remove(chapterToDelete)
  }

  async removeSubChapter(id: string) {
    const subChapterToDelete = await this.findOneSubChapter(id)
    return this.subChapterRepository.remove(subChapterToDelete)
  }

  async removeCourseDocument(id: string) {
    const courseDocumentToDelete = await this.findOneCourseDocument(id)
    return this.courseDocumentRepository.remove(courseDocumentToDelete)
  }

  async assignUserToCourse(courseId: any, userId: any) {
    const user = await this.usersService.findOneUserById(userId, true)
    const course = await this.findOneCourse(courseId)

    course?.users.push(user)

    return this.courseRepository.save(course)
  }

  async unassignUserFromCourse(courseId: string, userId: string) {
    const userToUnassign = await this.usersService.findOneUserById(userId, true)
    const course = await this.findOneCourse(courseId)

    const courseAlreadyHasUser = course.users
      .map(user => user.id)
      .includes(userId)

    if (!courseAlreadyHasUser)
      throw new BadRequestException(
        `User with id ${userId} dosen't have course with id ${courseId}.`,
      )

    course.users = course.users.filter(user => user.id !== userId)

    const updatedCourse = await this.courseRepository.save(course)

    return !updatedCourse.users.includes(userToUnassign)
  }
}

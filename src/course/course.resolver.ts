import { HttpException, ParseUUIDPipe } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { NotificationService } from 'src/notification/notification.service'
import { CourseService } from './course.service'
import { CreateChapterInput } from './dto/create-chapter.input'
import { CreateCourseDocumentInput } from './dto/create-course-document.input'
import { CreateCourseInput } from './dto/create-course.input'
import { CreateSubChapterInput } from './dto/create-sub-chapter.input'
import { UpdateChapterInput } from './dto/update-chapter.input'
import { UpdateCourseDocumentInput } from './dto/update-course-document.input'
import { UpdateCourseInput } from './dto/update-course.input'
import { UpdateSubChapterInput } from './dto/update-sub-chapter.input'

import { createWriteStream } from 'node:fs'
import { join } from 'node:path'
import { UUIDArrayDto } from 'src/app/dto/uuid-array.dto'
import {
  documentFileFilter,
  editFileName,
} from 'src/files/utils/file-upload.utils'
import { NotificationType } from 'src/graphql'
import { Course } from './entities/course.entity'
import { Chapter } from './entities/chapter.entity'
import { UsersService } from 'src/users/users.service'

@Resolver('Course')
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly notificationService: NotificationService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation('createCourse')
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return this.courseService.createOneCourse(createCourseInput)
  }

  @Mutation('updateCourse')
  updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    return this.courseService.updateCourse(
      updateCourseInput.id,
      updateCourseInput,
    )
  }

  @Mutation('removeCourse')
  removeCourse(@Args('id', ParseUUIDPipe) id: string) {
    return this.courseService.removeCourse(id)
  }

  @Query('courses')
  findAllCourses() {
    return this.courseService.findAllCourses()
  }

  @Query('course')
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.courseService.findOneCourse(id)
  }
  @ResolveField('courseDocuments')
  findCourseDocuments(@Parent() course: Course) {
    return this.courseService.findCourseDocumentsForCourse(course.id)
  }

  @Mutation('assignStudentToCourse')
  async assignStudentToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('studentId', ParseUUIDPipe) studentId: string,
  ) {
    try {
      this.courseService.assignStudentToCourse(courseId, studentId)
    } catch (error) {
      return false
    }
    await this.notificationService.create({
      data: JSON.stringify({ courseId }),
      recipientId: studentId,
      type: NotificationType.COURSE_ADDITION,
    })
    return true
  }

  @Mutation('assignTeacherToCourse')
  async assignTeacherToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    try {
      await this.courseService.assignTeacherToCourse(courseId, teacherId)
    } catch (error) {
      throw error
    }
    await this.notificationService.create({
      data: JSON.stringify({ courseId }),
      recipientId: teacherId,
      type: NotificationType.TEACHER_COURSE_ASSIGNMENT,
    })
    return true
  }

  @Mutation('assignClassToCourse')
  async assignClassToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    try {
      this.courseService.assignClassToCourse(courseId, classId)
    } catch (error) {
      return false
    }
    const studentClass = await this.usersService.findOneStudentClass(classId)
    const course = this.courseService.findOneCourse(courseId)
    await this.usersService.findAllStudentsByClassId(classId).then(users =>
      Promise.all(
        users.map(user =>
          this.notificationService.create({
            data: JSON.stringify({
              studentClass,
              course,
              user,
            }),
            recipientId: user.id,
            type: NotificationType.COURSE_CLASS_ADDITION,
          }),
        ),
      ),
    )
    return true
  }

  @Mutation('assignClassesToCourses')
  async assignClassesToCourses(
    @Args('coursesIds') _coursesIds: UUIDArrayDto,
    @Args('classesIds') _classesIds: UUIDArrayDto,
  ) {
    try {
      this.courseService.assignClassesToCourses(_coursesIds, _classesIds)
    } catch (error) {
      return false
    }
    return true
  }

  @Mutation('assignCourseToDepartment')
  async assignCourseToDepartment(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
  ) {
    try {
      this.courseService.assignCourseToDepartment(courseId, departmentId)
    } catch (error) {
      return false
    }
    return true
  }

  @Mutation('assignOwnerToCourse')
  async assignOwnerToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('ownerId', ParseUUIDPipe) ownerId: string,
  ) {
    try {
      await this.courseService.assignOwnerToCourse(courseId, ownerId)
    } catch (error) {
      const { status } = error
      throw new HttpException(error, status)
    }
    return true
  }

  @Mutation('unassignStudentFromCourse')
  unassignStudentFromCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.courseService.unassignStudentFromCourse(courseId, studentId)
  }

  @Mutation('unassignTeacherFromCourse')
  unassignTeacherFromCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    return this.courseService.unassignTeacherFromCourse(courseId, teacherId)
  }

  @Mutation('unassignClassFromCourse')
  unassignClassFromCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('classId', ParseUUIDPipe) classId: string,
  ) {
    return this.courseService.unassignClassFromCourse(courseId, classId)
  }

  @Mutation('unassignClassesFromCourses')
  async unassignClassesFromCourses(
    @Args('coursesIds') coursesIds: UUIDArrayDto,
    @Args('classesIds') classesIds: UUIDArrayDto,
  ) {
    try {
      await this.courseService.unassignClassesFromCourses(
        coursesIds,
        classesIds,
      )
    } catch (error) {
      throw error
    }
    return true
  }

  @Mutation('unassignCourseFromDepartment')
  async unassignCourseFromDepartment(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('departmentId', ParseUUIDPipe) departmentId: string,
  ) {
    try {
      await this.courseService.unassignCourseFromDepartment(
        courseId,
        departmentId,
      )
    } catch (error) {
      const { status } = error
      throw new HttpException(error, status)
    }
    return true
  }

  @Mutation('unassignOwnerFromCourse')
  async unassignOwnerFromCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('ownerId', ParseUUIDPipe) ownerId: string,
  ) {
    try {
      await this.courseService.unassignOwnerFromCourse(courseId, ownerId)
    } catch (error) {
      const { status } = error
      throw new HttpException(error, status)
    }
    return true
  }

  @Mutation('createChapter')
  createChapter(
    @Args('createChapterInput') createChapterInput: CreateChapterInput,
  ) {
    return this.courseService.createOneChapter(createChapterInput)
  }

  @Mutation('updateChapter')
  updateChapter(
    @Args('updateChapterInput') updateChapterInput: UpdateChapterInput,
  ) {
    return this.courseService.updateChapter(
      updateChapterInput.id,
      updateChapterInput,
    )
  }

  @Mutation('removeChapter')
  removeChapter(@Args('id', ParseUUIDPipe) id: string) {
    return this.courseService.removeChapter(id)
  }

  @Mutation('createSubChapter')
  createSubChapter(
    @Args('createSubChapterInput') createSubChapterInput: CreateSubChapterInput,
  ) {
    return this.courseService.createOneSubChapter(createSubChapterInput)
  }

  @Mutation('updateSubChapter')
  updateSubChapter(
    @Args('updateSubChapterInput') updateSubChapterInput: UpdateSubChapterInput,
  ) {
    return this.courseService.updateSubChapter(
      updateSubChapterInput.id,
      updateSubChapterInput,
    )
  }

  @Mutation('removeSubChapter')
  removeSubChapter(@Args('id', ParseUUIDPipe) id: string) {
    return this.courseService.removeSubChapter(id)
  }

  @Mutation('createCourseDocument')
  async createCourseDocument(
    @Args('createCourseDocumentInput')
    createCourseDocumentInput: CreateCourseDocumentInput,
  ) {
    const { fileUpload } = createCourseDocumentInput
    const { createReadStream, filename } = await fileUpload
    documentFileFilter(filename)
    const storedFileName = editFileName(filename)
    await new Promise((resolve, reject) => {
      const readStream = createReadStream()
      readStream
        .pipe(createWriteStream(join(__dirname, '../upload', storedFileName)))
        .on('close', resolve)
        .on('error', reject)
    })
    return this.courseService.createOneCourseDocument(
      createCourseDocumentInput,
      storedFileName,
    )
  }

  @Mutation('updateCourseDocument')
  updateCourseDocument(
    @Args('updateCourseDocumentInput')
    updateCourseDocumentInput: UpdateCourseDocumentInput,
  ) {
    return this.courseService.updateCourseDocument(
      updateCourseDocumentInput.id,
      updateCourseDocumentInput,
    )
  }

  @Mutation('removeCourseDocument')
  removeCourseDocument(@Args('id', ParseUUIDPipe) id: string) {
    return this.courseService.removeCourseDocument(id)
  }

  @ResolveField('teachers')
  async teachers(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).teachers
  }

  @ResolveField('students')
  async students(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).students
  }

  @ResolveField('owner')
  async owner(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).owner
  }

  @ResolveField('takingClasses')
  async takingClasses(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).takingClasses
  }

  @ResolveField('owningDepartment')
  async owningDepartment(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).owningDepartment
  }
  @ResolveField('assignmentDefinitions')
  async assignmentDefinitions(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id))
      .assignmentDefinitions
  }
}
@Resolver('Chapter')
export class ChapterResolver {
  constructor(private readonly courseService: CourseService) {}

  @ResolveField('subChapters')
  async subChapters(@Parent() chapter: Chapter) {
    return (await this.courseService.findOneChapter(chapter.id)).subChapters
  }

  @ResolveField('documents')
  async documents(@Parent() chapter: Chapter) {
    return (await this.courseService.findOneChapter(chapter.id)).documents
  }
}

@Resolver('CourseDocument')
export class CourseDocumentResolver {
  constructor(private readonly courseService: CourseService) {}

  @ResolveField('chapter')
  async chapter(@Parent() chapter: Chapter) {
    return (await this.courseService.findOneCourseDocument(chapter.id)).chapter
  }
}

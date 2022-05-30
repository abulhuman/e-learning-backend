import { ParseUUIDPipe } from '@nestjs/common'
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
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
import {
  documentFileFilter,
  editFileName,
} from 'src/files/utils/file-upload.utils'
import { join } from 'node:path'
import { Course } from './entities/course.entity'
import { UUIDArrayDto } from 'src/app/dto/uuid-array.dto'

@Resolver('Course')
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly notificationService: NotificationService,
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
    // todo send notification
    // if (updatedCourse.users.some(user => user.id === userId)) {
    //   const notification = await this.notificationService.create({
    //     data: JSON.stringify(updatedCourse),
    //     recipientId: userId,
    //     type: NotificationType.COURSE_ADDITION,
    //   })
    //   await this.notificationService.dispatch(notification)
    //   return true
    // }
    return true
  }

  @Mutation('assignTeacherToCourse')
  async assignTeacherToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('teacherId', ParseUUIDPipe) teacherId: string,
  ) {
    try {
      this.courseService.assignTeacherToCourse(courseId, teacherId)
    } catch (error) {
      return false
    }
    // todo send notification
    // if (updatedCourse.users.some(user => user.id === userId)) {
    //   const notification = await this.notificationService.create({
    //     data: JSON.stringify(updatedCourse),
    //     recipientId: userId,
    //     type: NotificationType.COURSE_ADDITION,
    //   })
    //   await this.notificationService.dispatch(notification)
    //   return true
    // }
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
    // todo send notification
    // if (updatedCourse.users.some(user => user.id === userId)) {
    //   const notification = await this.notificationService.create({
    //     data: JSON.stringify(updatedCourse),
    //     recipientId: userId,
    //     type: NotificationType.COURSE_ADDITION,
    //   })
    //   await this.notificationService.dispatch(notification)
    //   return true
    // }
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
    // todo send notification
    // if (updatedCourse.users.some(user => user.id === userId)) {
    //   const notification = await this.notificationService.create({
    //     data: JSON.stringify(updatedCourse),
    //     recipientId: userId,
    //     type: NotificationType.COURSE_ADDITION,
    //   })
    //   await this.notificationService.dispatch(notification)
    //   return true
    // }
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

  @ResolveField('takingClasses')
  async takingClasses(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).takingClasses
  }

  @ResolveField('owningDepartment')
  async owningDepartment(@Parent() course: Course) {
    return (await this.courseService.findOneCourse(course.id)).owningDepartment
  }
}

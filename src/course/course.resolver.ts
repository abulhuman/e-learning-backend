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
import { NotificationType } from 'src/graphql'

import { createWriteStream } from 'node:fs'
import {
  documentFileFilter,
  editFileName,
} from 'src/files/utils/file-upload.utils'
import { join } from 'node:path'
import { Course } from './entities/course.entity'
import { Chapter } from './entities/chapter.entity'

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

  @Mutation('assignUserToCourse')
  async assignUserToCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('userId', ParseUUIDPipe) userId: string,
  ) {
    const updatedCourse = await this.courseService.assignUserToCourse(
      courseId,
      userId,
    )
    if (updatedCourse.users.some(user => user.id === userId)) {
      const notification = await this.notificationService.create({
        data: JSON.stringify(updatedCourse),
        recipientId: userId,
        type: NotificationType.COURSE_ADDITION,
      })
      await this.notificationService.dispatch(notification)
      return true
    }
    return false
  }

  @Mutation('unassignUserFromCourse')
  unassignUserFromCourse(
    @Args('courseId', ParseUUIDPipe) courseId: string,
    @Args('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.courseService.unassignUserFromCourse(courseId, userId)
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

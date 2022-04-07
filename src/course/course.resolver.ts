import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { CourseService } from './course.service'
import { CreateChapterInput } from './dto/create-chapter.input'
import { CreateCourseDocumentInput } from './dto/create-course-document.input'
import { CreateCourseInput } from './dto/create-course.input'
import { CreateSubChapterInput } from './dto/create-sub-chapter.input'
import { UpdateCourseInput } from './dto/update-course.input'

@Resolver('Course')
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation('createCourse')
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return this.courseService.createOneCourse(createCourseInput)
  }
  @Mutation('createChapter')
  createChapter(
    @Args('createChapterInput') createChapterInput: CreateChapterInput,
  ) {
    return this.courseService.createOneChapter(createChapterInput)
  }

  @Mutation('createSubChapter')
  createSubChapter(
    @Args('createSubChapterInput') createSubChapterInput: CreateSubChapterInput,
  ) {
    return this.courseService.createOneSubChapter(createSubChapterInput)
  }

  @Mutation('createCourseDocument')
  createCourseDocument(
    @Args('createCourseDocumentInput')
    createCourseDocumentInput: CreateCourseDocumentInput,
  ) {
    return this.courseService.createOneCourseDocument(createCourseDocumentInput)
  }

  @Query('courses')
  findAllCourses() {
    return this.courseService.findAllCourses()
  }

  @Query('course')
  findOne(@Args('id') id: string) {
    return this.courseService.findOneCourse(id)
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
  removeCourse(@Args('id') id: string) {
    return this.courseService.removeCourse(id)
  }
}

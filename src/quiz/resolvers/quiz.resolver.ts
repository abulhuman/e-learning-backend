import { ParseUUIDPipe } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { CreateQuizInput, GradeAttemptInput } from 'src/graphql'
import { Quiz } from '../entities/quiz.entity'
import { QuizService } from '../quiz.service'
import { QuizSectionService } from '../services/quiz-section.service'

@Resolver('Quiz')
export class QuizResolver {
  constructor(
    private quizService: QuizService,
    private quizSectionService: QuizSectionService,
  ) {}

  @Query('quiz')
  findOne(@Args('id', ParseUUIDPipe) quizID: string) {
    return this.quizService.findOneById(quizID)
  }

  @Query('quizzes')
  findMany() {
    return this.quizService.findAll()
  }

  @Query('completeQuiz')
  complete(@Args('id') id: string) {
    return this.quizService.findOne({ id }, [
      'sections',
      'sections.questions',
      'sections.questions.subQuestions',
      'sections.questions.choices',
    ])
  }

  @Query('quizzesForCourse')
  findManyForCourse(@Args('courseId', ParseUUIDPipe) courseId: string) {
    return this.quizService.findMany({ course: { id: courseId } }, ['attempts'])
  }

  @ResolveField('sections')
  async getSections(@Parent() quiz: Quiz) {
    const sections = await this.quizSectionService.findAllForQuiz(quiz.id)
    return sections
  }
  @Mutation('createQuiz')
  create(@Args('input') input: CreateQuizInput) {
    return this.quizService.create(input)
  }
  @Mutation('gradeAttempt')
  grade(@Args('input') input: GradeAttemptInput) {
    return this.quizService.gradeAttempt(input)
  }

  @Mutation('deleteQuiz')
  delete(@Args('quizId') quizId: string) {
    return this.quizService.delete(quizId)
  }
}

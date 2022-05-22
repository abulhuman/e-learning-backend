import { ParseUUIDPipe } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { CreateQuizInput } from 'src/graphql'
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

  @ResolveField('sections')
  async getSections(@Parent() quiz: Quiz) {
    const sections = await this.quizSectionService.findAllForQuiz(quiz.id)
    return sections
  }
  @Mutation('createQuiz')
  create(@Args('input') input: CreateQuizInput) {
    return this.quizService.create(input)
  }
}

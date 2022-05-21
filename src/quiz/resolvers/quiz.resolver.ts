import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CreateQuizInput } from 'src/graphql'
import { QuizService } from '../quiz.service'

@Resolver('Quiz')
export class QuizResolver {
  constructor(private quizService: QuizService) {}

  @Query('quiz')
  findOne(@Args('id', ParseUUIDPipe) quizID: string) {
    return this.quizService.findOneById(quizID)
  }

  @Query('quizzes')
  findMany() {
    return this.quizService.findAll()
  }

  @Mutation('createQuiz')
  create(@Args('input') input: CreateQuizInput) {
    return this.quizService.create(input)
  }
}

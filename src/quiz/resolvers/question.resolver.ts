import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Resolver, Query } from '@nestjs/graphql'
import { QuestionService } from '../services/question.service'

@Resolver('Question')
export class QuestionResolver {
  constructor(private questionService: QuestionService) {}
  @Query('question')
  getQuestion(@Args('id', ParseUUIDPipe) id: string) {
    return this.questionService.getQuestion(id)
  }

  @Query('questionsForQuiz')
  getQuestionsForQuiz(@Args('quizId', ParseUUIDPipe) id: string) {
    return this.questionService.findAllForQuiz(id)
  }
}

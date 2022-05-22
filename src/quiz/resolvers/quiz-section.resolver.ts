import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { QuizSection } from '../entities/quiz-section.entity'
import { QuizSectionService } from '../services/quiz-section.service'

@Resolver('QuizSection')
export class QuizSectionResolver {
  constructor(private quizSectionService: QuizSectionService) {}

  @Query('quizSections')
  findAll() {
    return this.quizSectionService.findAll()
  }

  @ResolveField('quiz')
  quiz(@Parent() quizSection: QuizSection) {
    return quizSection.quiz
  }
}

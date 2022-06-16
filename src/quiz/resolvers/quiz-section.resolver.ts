import { NotFoundException, ParseUUIDPipe } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { QuizSection } from '../entities/quiz-section.entity'
import { QuestionService } from '../services/question.service'
import { QuizSectionService } from '../services/quiz-section.service'

@Resolver('QuizSection')
export class QuizSectionResolver {
  constructor(
    private quizSectionService: QuizSectionService,
    private questionService: QuestionService,
  ) {}

  @Query('quizSections')
  findAll() {
    return this.quizSectionService.findAll()
  }

  @Query('quizSection')
  async findOne(@Args('id', ParseUUIDPipe) id: string) {
    const section = await this.quizSectionService.findOne(id)
    if (!section) {
      throw new NotFoundException()
    }
    return section
  }

  @ResolveField('quiz')
  quiz(@Parent() quizSection: QuizSection) {
    return quizSection.quiz
  }

  @ResolveField('questions')
  questions(@Parent() section: QuizSection) {
    return this.questionService.findAllForQuizSection(section.id)
  }
}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cloze, MultipleChoice, Question } from './entities/question.entity'
import { QuizSection } from './entities/quiz-section.entity'
import { Quiz } from './entities/quiz.entity'
import { QuizService } from './quiz.service'
import { QuestionResolver } from './resolvers/question.resolver'
import { QuizSectionResolver } from './resolvers/quiz-section.resolver'
import { QuizResolver } from './resolvers/quiz.resolver'
import { QuestionService } from './services/question.service'
import { QuizSectionService } from './services/quiz-section.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizSection,
      Question,
      MultipleChoice,
      Cloze,
    ]),
  ],
  providers: [
    QuizResolver,
    QuizSectionResolver,
    QuizService,
    QuizSectionService,
    QuestionService,
    QuestionResolver,
  ],
})
export class QuizModule {}

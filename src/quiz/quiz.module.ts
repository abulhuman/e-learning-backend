import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Question } from './entities/question.entity'
import { QuizSection } from './entities/quiz-section.entity'
import { Quiz } from './entities/quiz.entity'
import { QuizService } from './quiz.service'
import { QuizSectionResolver } from './resolvers/quiz-section.resolver'
import { QuizResolver } from './resolvers/quiz.resolver'
import { QuizSectionService } from './services/quiz-section.service'

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizSection, Question])],
  providers: [
    QuizResolver,
    QuizSectionResolver,
    QuizService,
    QuizSectionService,
  ],
})
export class QuizModule {}

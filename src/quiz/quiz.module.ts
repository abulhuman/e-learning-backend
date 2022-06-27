import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CourseModule } from 'src/course/course.module'
import { UsersModule } from 'src/users/users.module'
import { Cloze, MultipleChoice, Question } from './entities/question.entity'
import { QuestionAttempt, QuizAttempt } from './entities/quiz-attempt.entity'
import { QuizGrade } from './entities/quiz-grade.entity'
import { QuizSection } from './entities/quiz-section.entity'
import { Quiz } from './entities/quiz.entity'
import { QuizService } from './quiz.service'
import { QuestionResolver } from './resolvers/question.resolver'
import { QuizAttemptResolver } from './resolvers/quiz-attempt.resolver'
import { QuizSectionResolver } from './resolvers/quiz-section.resolver'
import { QuizResolver } from './resolvers/quiz.resolver'
import { QuestionService } from './services/question.service'
import { QuizAttemptService } from './services/quiz-attempt.service'
import { QuizSectionService } from './services/quiz-section.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      QuizSection,
      Question,
      MultipleChoice,
      Cloze,
      QuizAttempt,
      QuestionAttempt,
      QuizGrade,
    ]),
    UsersModule,
    CourseModule,
  ],
  providers: [
    QuizResolver,
    QuizSectionResolver,
    QuizService,
    QuizSectionService,
    QuestionService,
    QuestionResolver,
    QuizAttemptResolver,
    QuizAttemptService,
  ],
})
export class QuizModule {}

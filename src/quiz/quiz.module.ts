import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Quiz } from './entities/quiz.entity'
import { QuizService } from './quiz.service'
import { QuizResolver } from './resolvers/quiz.resolver'

@Module({
  imports: [TypeOrmModule.forFeature([Quiz])],
  providers: [QuizResolver, QuizService],
})
export class QuizModule {}

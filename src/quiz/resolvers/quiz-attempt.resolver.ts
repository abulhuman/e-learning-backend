import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { AttemptQuestionInput, CreateQuizAttemptInput } from 'src/graphql'
import { QuizService } from '../quiz.service'
import { QuizAttemptService } from '../services/quiz-attempt.service'
@Resolver('QuizAttempt')
export class QuizAttemptResolver {
  constructor(
    private quizAttemptService: QuizAttemptService,
    private quizService: QuizService,
  ) {}

  @Mutation('createQuizAttempt')
  createAttempt(@Args('input') input: CreateQuizAttemptInput) {
    return this.quizAttemptService.create(input)
  }

  @Mutation('completeAttempt')
  completeAttempt(@Args('attemptId') attemptId: string) {
    return this.quizAttemptService.complete(attemptId)
  }

  @Mutation('attemptQuestion')
  attemptQuestion(@Args('input') input: AttemptQuestionInput) {
    return this.quizAttemptService.attemptQuestion(input)
  }

  @Query('attempt')
  getAttempt(@Args('id') id: string) {
    return this.quizAttemptService.findOne({ id }, [
      'questions',
      'questions.question',
      'questions.subQuestions',
      'grade',
      'grade.marker',
    ])
  }

  @Query('myAttemptForQuiz')
  attemptForQuiz(
    @Args('quizId') quizId: string,
    @Args('userId') userId: string,
  ) {
    return this.quizAttemptService.findOne(
      { quiz: { id: quizId }, user: { id: userId } },
      ['grade', 'grade.marker', 'questions', 'questions.subQuestions'],
    )
  }
  @Query('attemptsForQuiz')
  attemptsForQuiz(@Args('quizId') quizId: string) {
    return this.quizAttemptService.findAllForQuiz(quizId)
  }
}

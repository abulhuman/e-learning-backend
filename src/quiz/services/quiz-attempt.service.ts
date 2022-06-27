import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as moment from 'moment'
import {
  AttemptQuestionInput,
  CreateQuizAttemptInput,
  QuestionType,
} from 'src/graphql'
import { UsersService } from 'src/users/users.service'
import { FindConditions, Repository } from 'typeorm'
import {
  QuestionAttempt,
  QuizAttempt,
  SubQuestionAttempt,
} from '../entities/quiz-attempt.entity'
import { QuizService } from '../quiz.service'
import { QuestionService } from './question.service'

@Injectable()
export class QuizAttemptService {
  constructor(
    @InjectRepository(QuizAttempt) private attemptRepo: Repository<QuizAttempt>,
    private quizService: QuizService,
    @InjectRepository(QuestionAttempt)
    private questionAttemptRepo: Repository<QuestionAttempt>,
    private userService: UsersService,
    private questionService: QuestionService,
  ) {}

  findOne(options: FindConditions<QuizAttempt>, withRelations: string[] = []) {
    return this.attemptRepo.findOne(options, { relations: withRelations })
  }

  findAllForQuiz(quizId: string) {
    return this.findMany({ quiz: { id: quizId } }, [
      'questions',
      'questions.subQuestions',
      'grade',
      'user',
    ])
  }

  existsForUserAndQuiz(userId: string, quizId: string) {
    return this.attemptRepo
      .createQueryBuilder('attempt')
      .leftJoin('attempt.quiz', 'quiz')
      .leftJoin('attempt.user', 'user')
      .where('quiz.id = :quizId', { quizId })
      .andWhere('user.id = :userId', { userId })
      .getCount()
  }

  private findMany(
    options: FindConditions<QuizAttempt>,
    relations: string[] = [],
  ) {
    return this.attemptRepo.find({ where: options, relations })
  }

  async create(input: CreateQuizAttemptInput) {
    const quiz = await this.quizService.findOneById(input.quizId)
    const { end } = quiz
    if (moment(end).diff(moment()) <= 0) {
      throw new BadRequestException(
        `Quiz already ended on ${moment(end).format()}`,
      )
    }
    const attemptExists = await this.existsForUserAndQuiz(
      input.userId,
      input.quizId,
    )
    if (attemptExists > 0) {
      throw new BadRequestException('Quiz Attempt already exists')
    }
    const user = await this.userService.findOneUserById(input.userId)
    const attempt = this.attemptRepo.create({
      quiz,
      user,
    })
    return this.attemptRepo.save(attempt)
  }

  async complete(id: string) {
    const attempt = await this.findOne({ id })
    if (!attempt) {
      throw new NotFoundException()
    }
    attempt.completed = true
    return this.attemptRepo.save(attempt)
  }

  async attemptQuestion(input: AttemptQuestionInput) {
    const attempt = await this.findOne({ id: input.attemptID }, [
      'questions',
      'questions.question',
    ])
    if (attempt.completed) {
      throw new BadRequestException('Quiz attempt over')
    }
    const indexOfExisting = attempt.questions.findIndex(
      questionAttempt => questionAttempt.question.id === input.questionID,
    )
    if (indexOfExisting !== -1) {
      await this.questionAttemptRepo.delete(attempt.questions[indexOfExisting])
      attempt.questions.splice(indexOfExisting, 1)
    }
    const question = await this.questionService.findOne({
      id: input.questionID,
    })
    if (!question) {
      throw new NotFoundException(`Question with not found `)
    }
    const questionAttempt = new QuestionAttempt()
    if (input.questionType === QuestionType.CLOZE) {
      questionAttempt.subQuestions = input.subQuestions.map(
        subQuestionInput => {
          const subquestionAttempt = new SubQuestionAttempt()
          subquestionAttempt.answer = subQuestionInput.answer
          subquestionAttempt.number = subQuestionInput.number
          return subquestionAttempt
        },
      )
    } else {
      questionAttempt.answer = input.answer
    }
    questionAttempt.question = question
    attempt.questions.push(questionAttempt)
    return this.attemptRepo.save(attempt)
  }
}

import {
  QuestionAttempt as IQuestionAttempt,
  QuizAttempt as IQuizAttempt,
  SubQuestionAttempt as ISubQuestionAttempt,
} from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Question } from './question.entity'
import { Quiz } from './quiz.entity'

@Entity()
export class QuizAttempt implements IQuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => User, (user: User) => user.quizAttempts, {
    onDelete: 'CASCADE',
  })
  user: User

  @ManyToOne(() => Quiz, quiz => quiz.attempts)
  quiz: Quiz

  @Column({ default: false })
  completed: boolean

  @OneToMany(() => QuestionAttempt, question => question.quizAttempt, {
    cascade: true,
  })
  questions?: QuestionAttempt[]
}

@Entity()
export class QuestionAttempt implements IQuestionAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => QuizAttempt, quizAttempt => quizAttempt.questions, {
    onDelete: 'CASCADE',
  })
  quizAttempt: QuizAttempt

  @ManyToOne(() => Question, question => question.attempts)
  question: Question
  @Column()
  answer?: string

  @ManyToOne(() => SubQuestionAttempt, attempt => attempt.questionAttempt, {
    cascade: true,
  })
  subQuestions?: SubQuestionAttempt[]
}

@Entity()
export class SubQuestionAttempt implements ISubQuestionAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @Column()
  number: number
  @Column()
  answer: string

  @OneToMany(() => QuestionAttempt, attempt => attempt.subQuestions, {
    onDelete: 'CASCADE',
  })
  questionAttempt: QuestionAttempt
}

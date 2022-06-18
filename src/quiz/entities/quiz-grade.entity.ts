import { QuizGrade as IQuizGrade } from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { QuizAttempt } from './quiz-attempt.entity'
@Entity()
export class QuizGrade implements IQuizGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string
  @OneToOne(() => QuizAttempt, attempt => attempt.grade, {
    onDelete: 'CASCADE',
  })
  attempt: QuizAttempt
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  marker: User
  @Column()
  score: number
}

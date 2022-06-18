import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Quiz as IQuiz } from 'src/graphql'
import { QuizSection } from './quiz-section.entity'
import { QuizAttempt } from './quiz-attempt.entity'
@Entity()
export class Quiz implements IQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ nullable: true })
  description?: string

  @Column({ type: 'timestamptz' })
  start: Date

  @Column({ type: 'timestamptz' })
  end: Date

  @CreateDateColumn()
  created_at: Date

  @Column({ type: 'int' })
  duration: number

  @Column()
  maxScore: number

  @OneToMany(() => QuizSection, section => section.quiz, { cascade: true })
  sections: QuizSection[]

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz, { cascade: true })
  attempts: QuizAttempt[]
}

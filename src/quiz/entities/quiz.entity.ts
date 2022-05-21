import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Quiz as IQuiz } from 'src/graphql'
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
}

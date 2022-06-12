import { QuizSection as IQuizSection, QuizSectionType } from 'src/graphql'
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { Question } from './question.entity'
import { Quiz } from './quiz.entity'

@Entity()
@TableInheritance({
  column: { type: 'varchar', name: 'type', select: true },
})
export class QuizSection implements IQuizSection {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  description?: string

  @CreateDateColumn()
  created_at: Date

  @Column()
  number: number

  @ManyToOne(() => Quiz, quiz => quiz.sections, {
    onDelete: 'CASCADE',
  })
  quiz: Quiz

  @OneToMany(() => Question, (question: Question) => question.section, {
    cascade: true,
  })
  questions: Question[]
}

@ChildEntity()
export class ObjectiveQuizSection extends QuizSection {
  @Column({ default: QuizSectionType.OBJECTIVE })
  sectionType: string
}

@ChildEntity()
export class SubjectiveQuizSection extends QuizSection {
  @Column({ default: QuizSectionType.SUBJECTIVE })
  sectionType: string
}

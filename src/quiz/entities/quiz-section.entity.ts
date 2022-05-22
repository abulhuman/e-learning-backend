import { QuizSection as IQuizSection, QuizSectionType } from 'src/graphql'
import {
  ChildEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
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

  @ManyToOne(() => Quiz, quiz => quiz.sections, {
    onDelete: 'CASCADE',
  })
  quiz: Quiz
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

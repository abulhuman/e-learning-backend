import { CriterionValue as ICriterionValue } from 'src/graphql'
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  Entity,
  Unique,
} from 'typeorm'
import { AssignmentCriterion } from './assignment-criterion.entity'
import { AssignmentSubmission } from './assignment-submission.entity'

@Entity()
@Unique(['criterion', 'submission'])
export class CriterionValue implements ICriterionValue {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column({ type: 'float' })
  score: number

  @ManyToOne(
    () => AssignmentCriterion,
    (criterion: AssignmentCriterion) => criterion.values,
  )
  criterion?: AssignmentCriterion

  @ManyToOne(
    () => AssignmentSubmission,
    (submission: AssignmentSubmission) => submission.values,
  )
  submission?: AssignmentSubmission
}

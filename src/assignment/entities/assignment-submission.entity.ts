import { AssignmentSubmission as IAssignmentSubmission } from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AssignmentDefinition } from './assignment-definition.entity'
import { CriterionValue } from './criterion-value.entity'

@Entity()
export class AssignmentSubmission implements IAssignmentSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column({ type: 'timestamp' })
  submissionDate: Date

  @Column({ type: 'float', nullable: true })
  totalScore?: number

  @Column()
  submissionFile: string

  @ManyToOne(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.submissions,
    {
      onDelete: 'CASCADE',
    },
  )
  definition: AssignmentDefinition

  @ManyToOne(() => User, (user: User) => user.assignmentSubmissions, {
    onDelete: 'SET NULL',
  })
  submittedBy: User

  @OneToMany(() => CriterionValue, (value: CriterionValue) => value.submission)
  values?: CriterionValue[]
}

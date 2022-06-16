import { AssignmentCriterion as IAssignmentCriterion } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AssignmentDefinition } from './assignment-definition.entity'

@Entity()
export class AssignmentCriterion implements IAssignmentCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  title: string

  @Column({ nullable: true })
  description?: string

  @Column({ type: 'float' })
  weight: number

  @ManyToOne(
    () => AssignmentDefinition,
    (definition: AssignmentDefinition) => definition.criteria,
  )
  definition: AssignmentDefinition
}

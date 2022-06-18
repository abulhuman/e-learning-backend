import { AssignmentCriterion as IAssignmentCriterion } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AssignmentDefinition } from './assignment-definition.entity'
import { CriterionValue } from './criterion-value.entity'

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

  @Column({ type: 'int' })
  weight: number

  @ManyToOne(
    () => AssignmentDefinition,
    (definition: AssignmentDefinition) => definition.criteria,
  )
  definition: AssignmentDefinition

  @OneToMany(() => CriterionValue, (value: CriterionValue) => value.criterion)
  values?: CriterionValue[]
}

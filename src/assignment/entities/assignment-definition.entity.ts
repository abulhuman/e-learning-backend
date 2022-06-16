import { CourseDocument } from 'src/course/entities/course-document.entity'
import { Course } from 'src/course/entities/course.entity'
import { AssignmentDefinition as IAssignmentDefinition } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { AssignmentCriterion } from './assignment-criterion.entity'
import { AssignmentSubmission } from './assignment-submission.entity'

@Entity()
export class AssignmentDefinition implements IAssignmentDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column({ type: 'timestamp', nullable: true })
  submissionDeadline: Date

  @Column()
  name: string

  @OneToOne(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentDefinition,
  )
  @JoinColumn()
  instructionsFile: CourseDocument

  @ManyToOne(() => Course, (course: Course) => course.assignmentDefinitions, {
    onDelete: 'CASCADE',
  })
  course: Course

  @OneToMany(
    () => AssignmentSubmission,
    (submission: AssignmentSubmission) => submission.definition,
  )
  submissions?: AssignmentSubmission[]

  @OneToMany(
    () => AssignmentCriterion,
    (criterion: AssignmentCriterion) => criterion.definition,
  )
  criteria
}

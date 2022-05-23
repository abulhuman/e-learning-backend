import { CourseDocument } from 'src/course/entities/course-document.entity'
import { Course } from 'src/course/entities/course.entity'
import { AssignmentSubmission as IAssignmentSubmission } from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
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
import { AssignmentDefinition } from './assignment-definition.entity'

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

  @OneToOne(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentSubmission,
  )
  @JoinColumn()
  submissionFile: CourseDocument

  @ManyToOne(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.submissions,
  )
  definition: AssignmentDefinition

  @ManyToOne(() => User, (user: User) => user.assignmentSubmissions)
  submittedBy: User
}

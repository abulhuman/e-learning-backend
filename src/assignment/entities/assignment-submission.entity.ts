import { CourseDocument } from 'src/course/entities/course-document.entity'
import { Course } from 'src/course/entities/course.entity'
import { AssignmentSubmission as IAssignmentSubmission } from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
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

@Entity()
export class AssignmentSubmission implements IAssignmentSubmission {
  @PrimaryGeneratedColumn()
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column({ type: 'date' })
  submissionDate: Date

  @OneToMany(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentSubmission,
  )
  submissionFile: CourseDocument

  @OneToMany(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.submissionFiles,
  )
  assignmentDefinition: AssignmentDefinition

  @OneToMany(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentDefinition,
  )
  submittedBy: User
}

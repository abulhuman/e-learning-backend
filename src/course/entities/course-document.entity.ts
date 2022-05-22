import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { AssignmentSubmission } from 'src/assignment/entities/assignment-submission.entity'
import { CourseDocument as ICourseDocument } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { Course } from './course.entity'

@Entity()
export class CourseDocument implements ICourseDocument {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  documentType: string

  @Column()
  documentDisplayName: string

  @Column()
  storedFileName: string

  @RelationId('course')
  @Column({ nullable: true })
  courseId: string

  @ManyToOne(() => Course, (course: Course) => course.courseDocuments)
  course: Course

  @ManyToOne(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.instructionsFile,
  )
  assignmentDefinition?: AssignmentDefinition

  @ManyToOne(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.submissionFiles,
  )
  assignmentSubmission?: AssignmentSubmission
}

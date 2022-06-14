import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { AssignmentSubmission } from 'src/assignment/entities/assignment-submission.entity'
import { CourseDocument as ICourseDocument } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { Chapter } from './chapter.entity'
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

  @ManyToOne(() => Course, (course: Course) => course.courseDocuments, {
    onDelete: 'CASCADE',
  })
  course: Course

  @OneToOne(
    () => AssignmentDefinition,
    (assignmentDefinition: AssignmentDefinition) =>
      assignmentDefinition.instructionsFile,
  )
  assignmentDefinition?: AssignmentDefinition

  @OneToOne(
    () => AssignmentSubmission,
    (assignmentSubmission: AssignmentSubmission) =>
      assignmentSubmission.submissionFile,
  )
  assignmentSubmission?: AssignmentSubmission

  @ManyToOne(() => Chapter, (chapter: Chapter) => chapter.documents, {
    onDelete: 'CASCADE',
  })
  chapter?: Chapter
}

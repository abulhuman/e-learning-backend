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

  @OneToOne(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentDefinition,
  )
  @JoinColumn()
  instructionsFile: CourseDocument

  @ManyToOne(() => Course, (course: Course) => course.assignmentDefinitions)
  course: Course

  @OneToMany(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.assignmentSubmission,
  )
  submissionFiles?: CourseDocument[]
}

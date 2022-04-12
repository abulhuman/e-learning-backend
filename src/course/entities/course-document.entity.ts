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
  documentName: string

  @Column()
  documentURL: string

  @RelationId('course')
  @Column({ nullable: true })
  courseId: string

  @ManyToOne(() => Course, (course: Course) => course.courseDocuments)
  course: Course
}

import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { Course as ICourse } from 'src/graphql'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Chapter } from './chapter.entity'
import { CourseDocument } from './course-document.entity'

@Entity()
export class Course implements ICourse {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  code: string

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  overview: string

  @Column()
  creditHour: number

  @ManyToMany(() => User, (user: User) => user.courses)
  @JoinTable()
  users?: User[]

  @ManyToMany(() => User, (user: User) => user.teachingCourses)
  @JoinTable()
  teachers?: User[]

  @ManyToMany(() => User, (user: User) => user.attendingCourses)
  @JoinTable()
  students?: User[]

  @ManyToMany(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.attendingCourses,
  )
  @JoinTable()
  takingClasses?: StudentClass[]

  @OneToMany(() => Chapter, (chapter: Chapter) => chapter.course)
  chapters: Chapter[]

  @OneToMany(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.course,
  )
  courseDocuments: CourseDocument[]

  @OneToMany(
    () => CourseDocument,
    (courseDocument: CourseDocument) => courseDocument.course,
  )
  assignmentDefinitions?: AssignmentDefinition[]
}

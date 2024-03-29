import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { Course as ICourse } from 'src/graphql'
import { Quiz } from 'src/quiz/entities/quiz.entity'
import { Department } from 'src/users/entities/department.entity'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @ManyToOne(() => User, (user: User) => user.ownedCourses)
  owner: User

  @ManyToMany(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.attendingCourses,
  )
  @JoinTable()
  takingClasses?: StudentClass[]

  @OneToMany(() => Chapter, (chapter: Chapter) => chapter.course)
  chapters: Chapter[]

  @OneToMany(() => Quiz, quiz => quiz.course, { cascade: true })
  quizzes: Quiz[]

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

  @ManyToOne(
    () => Department,
    (department: Department) => department.ownedCourses,
  )
  owningDepartment: Department
}

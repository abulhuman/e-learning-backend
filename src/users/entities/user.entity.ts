import { AssignmentSubmission } from 'src/assignment/entities/assignment-submission.entity'
import { Course } from 'src/course/entities/course.entity'
import { User as IUser } from 'src/graphql'
import { ExcludeFromResponse } from 'src/utils/decorators/exclude-from-response.decorator'
import { Notification } from 'src/notification/entities/notification.entity'
import { QuizAttempt } from 'src/quiz/entities/quiz-attempt.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Department } from './department.entity'
import { Role } from './role.entity'
import { StudentClass } from './student-class.entity'

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @ExcludeFromResponse()
  @CreateDateColumn()
  created_at: Date

  @ExcludeFromResponse()
  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  firstName: string

  @Column()
  middleName: string

  @Column()
  lastName: string

  @Column({ unique: true })
  email: string

  @ExcludeFromResponse()
  @Column()
  password: string

  @ManyToMany(() => Role, (role: Role) => role.members)
  roles: Role[]

  @ManyToMany(() => Course, (course: Course) => course.users)
  courses?: Course[]

  @ManyToMany(() => Course, (course: Course) => course.teachers)
  teachingCourses?: Course[]

  @ManyToMany(() => Course, (course: Course) => course.students)
  attendingCourses?: Course[]

  @OneToMany(() => Course, (course: Course) => course.owner)
  ownedCourses: Course[]

  @ManyToOne(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.students,
    { onDelete: 'SET NULL' },
  )
  attendingClass: StudentClass

  @ManyToMany(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.teachers,
  )
  teachingClasses?: StudentClass[]

  @OneToMany(
    () => Notification,
    (notification: Notification) => notification.recipient,
  )
  notifications: Notification[]

  @OneToOne(
    () => Department,
    (department: Department) => department.departmentAdministrator,
  )
  department?: Department

  @OneToMany(() => QuizAttempt, (attempt: QuizAttempt) => attempt.user)
  quizAttempts: QuizAttempt[]
  @ManyToOne(
    () => AssignmentSubmission,
    (assignmentSubmission: AssignmentSubmission) =>
      assignmentSubmission.submittedBy,
    { onDelete: 'CASCADE' },
  )
  assignmentSubmissions?: AssignmentSubmission[]
}

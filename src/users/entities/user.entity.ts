import { Course } from 'src/course/entities/course.entity'
import { User as IUser } from 'src/graphql'
import { Notification } from 'src/notification/entities/notification.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from './role.entity'
import { StudentClass } from './student-class.entity'

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

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

  @Column()
  password: string

  @ManyToMany(() => Role, (role: Role) => role.members)
  roles: Role[]

  @ManyToMany(() => Course, (course: Course) => course.users)
  courses?: Course[]

  @ManyToOne(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.students,
  )
  attendingClass: StudentClass

  @ManyToMany(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.teachers,
  )
  learningClasses?: StudentClass[]

  @OneToMany(
    () => Notification,
    (notification: Notification) => notification.recipient,
  )
  notifications: Notification[]
}

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
import { StudentClass as IStudentClass } from 'src/graphql'
import { User } from './user.entity'
import { Department } from './department.entity'
import { Course } from 'src/course/entities/course.entity'

@Entity()
export class StudentClass implements IStudentClass {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  year: string

  @Column()
  section: string

  @ManyToMany(() => User, (user: User) => user.teachingClasses)
  @JoinTable()
  teachers?: User[]

  @OneToMany(() => User, (user: User) => user.attendingClass)
  students: User[]

  @ManyToMany(() => Course, (course: Course) => course.takingClasses)
  attendingCourses: Course[]

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  department?: Department
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Department as IDepartment } from 'src/graphql'
import { StudentClass } from './student-class.entity'
import { User } from './user.entity'
import { Course } from 'src/course/entities/course.entity'

@Entity()
export class Department implements IDepartment {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  name: string

  @OneToMany(
    () => StudentClass,
    (studentClass: StudentClass) => studentClass.department,
    { onDelete: 'CASCADE' },
  )
  classes?: StudentClass[]

  @OneToOne(() => User, (user: User) => user.department)
  @JoinColumn()
  departmentAdministrator?: User

  @OneToMany(() => Course, (course: Course) => course.owningDepartment)
  ownedCourses: Course[]
}

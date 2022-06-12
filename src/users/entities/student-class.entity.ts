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

  @ManyToMany(() => User, (user: User) => user.learningClasses)
  @JoinTable()
  teachers?: User[]

  @OneToMany(() => User, (user: User) => user.attendingClass)
  students: User[]

  @ManyToOne(() => Department, { onDelete: 'CASCADE' })
  department?: Department
}

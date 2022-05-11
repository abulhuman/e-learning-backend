import { Course } from 'src/course/entities/course.entity'
import { User as IUser } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from './role.entity'
import { Notification } from 'src/notification/entities/notification.entity'

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

  @OneToMany(
    () => Notification,
    (notification: Notification) => notification.recipient,
  )
  notifications: Notification[]
}

import { Course } from 'src/course/entities/course.entity'
import { User as IUser } from 'src/graphql'
import { ExcludeFromResponse } from 'src/utils/decorators/exclude-from-response.decorator'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from './role.entity'

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
}

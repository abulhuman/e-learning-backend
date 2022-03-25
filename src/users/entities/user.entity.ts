import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User as IUser } from 'src/graphql'
import { Role } from './role.entity'

@Entity()
export class User implements IUser {
  constructor(firstName: string, middleName: string, lastName: string) {
    this.firstName = firstName
    this.middleName = middleName
    this.lastName = lastName
  }

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

  @ManyToMany(() => Role, (role: Role) => role.members)
  roles: Role[]
}

import { User as IUser } from 'src/graphql'
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

  @Column({ unique: true })
  email: string

  @Column()
  password: string
}

import { Role as IRole, RoleName } from 'src/graphql'
import { ExcludeFromResponse } from 'src/utils/decorators/exclude-from-response.decorator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'

@Entity()
export class Role implements IRole {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ExcludeFromResponse()
  @CreateDateColumn()
  created_at: Date

  @ExcludeFromResponse()
  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column({ type: 'enum', enum: RoleName, default: RoleName.DEV, unique: true })
  name: RoleName

  @ManyToMany(() => User, (user: User) => user.roles)
  @JoinTable()
  members: User[]
}

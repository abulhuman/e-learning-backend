import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity()
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  username: string

  @Column({ unique: true })
  email: string

  @Exclude()
  @Column()
  password: string
}

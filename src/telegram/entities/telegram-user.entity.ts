import { User } from 'src/users/entities/user.entity'
import { Entity, JoinColumn, OneToOne, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class TelegramUser {
  @PrimaryColumn('bigint')
  id: string

  @Column()
  first_name: string

  @OneToOne(() => User)
  @JoinColumn()
  user: User
}

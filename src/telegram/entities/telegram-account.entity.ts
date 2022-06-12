import { User } from 'src/users/entities/user.entity'
import { TelegramAccount as ITelegramAccount } from 'src/graphql'
import { Entity, JoinColumn, OneToOne, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class TelegramAccount implements ITelegramAccount {
  @PrimaryColumn('bigint')
  id: string

  @Column()
  first_name: string

  @OneToOne(() => User)
  @JoinColumn()
  user: User

  @Column({ nullable: true })
  chat_id?: string
}

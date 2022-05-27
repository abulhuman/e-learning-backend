import { AssignmentDefinition } from 'src/assignment/entities/assignment-definition.entity'
import { TelegramAccount as ITelegramAccount } from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'

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

  @OneToOne(() => AssignmentDefinition, { nullable: true, eager: true })
  @JoinColumn()
  pendingSubmission?: AssignmentDefinition
}

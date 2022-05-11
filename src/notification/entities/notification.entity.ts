import {
  Notification as INotification,
  NotificationStatus,
  NotificationType,
} from 'src/graphql'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Notification implements INotification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at?: Date

  @Column()
  data: string

  @Column()
  type: NotificationType

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status?: NotificationStatus

  @ManyToOne(() => User, (user: User) => user.notifications)
  recipient: User
}

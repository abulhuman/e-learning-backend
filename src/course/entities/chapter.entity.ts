import { Chapter as IChapter } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { Course } from './course.entity'
import { SubChapter } from './sub-chapter.entity'

@Entity()
export class Chapter implements IChapter {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date

  @Column()
  title: string

  @Column()
  sequenceNumber: number

  @RelationId('course')
  @Column({ nullable: true })
  courseId: string

  @ManyToOne(() => Course, (course: Course) => course.chapters, {
    onDelete: 'CASCADE',
  })
  course: Course

  @OneToMany(() => SubChapter, (subChapter: SubChapter) => subChapter.chapter)
  subChapters: SubChapter[]
}

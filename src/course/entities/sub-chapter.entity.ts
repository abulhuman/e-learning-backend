import { SubChapter as ISubChapter } from 'src/graphql'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { Chapter } from './chapter.entity'

@Entity()
export class SubChapter implements ISubChapter {
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

  @RelationId('chapter')
  @Column({ nullable: true })
  chapterId: string

  @ManyToOne(() => Chapter, (chapter: Chapter) => chapter.subChapters, {
    onDelete: 'CASCADE',
  })
  chapter: Chapter
}

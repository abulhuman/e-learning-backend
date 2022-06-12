import {
  Question as IQuestion,
  QuestionType,
  TrueFalse as ITrueFalse,
  MultipleChoice as IMultipleChoice,
  Cloze as ICloze,
  Essay as IEssay,
  SubQuestion as ISubQuestion,
  Choice as IChoice,
  AnswerTrueFalse,
} from 'src/graphql'
import {
  ChildEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { QuizSection } from './quiz-section.entity'

@Entity()
@TableInheritance({ column: { name: 'type', type: 'varchar' } })
export class Question implements IQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  text: string

  @Column()
  number: number

  @ManyToOne(() => QuizSection, section => section.questions, {
    onDelete: 'CASCADE',
  })
  section: QuizSection
}

@ChildEntity()
export class TrueFalse extends Question implements ITrueFalse {
  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.TRUE_FALSE,
  })
  questionType: QuestionType

  @Column()
  answer: AnswerTrueFalse
}

@ChildEntity()
export class MultipleChoice extends Question implements IMultipleChoice {
  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  questionType: QuestionType

  @OneToMany(() => Choice, choice => choice.question, { cascade: true })
  choices: Choice[]

  @Column()
  answer: string
}

@ChildEntity()
export class Cloze extends Question implements ICloze {
  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.CLOZE })
  questionType: QuestionType

  @OneToMany(() => SubQuestion, sub => sub.question, { cascade: true })
  subQuestions: SubQuestion[]
}

@ChildEntity()
export class Essay extends Question implements IEssay {
  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.ESSAY })
  questionType: QuestionType

  @Column()
  answer: string
}

@Entity()
export class SubQuestion implements ISubQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  number: number

  @Column()
  answer: string

  @ManyToOne(() => Cloze, question => question.subQuestions, {
    onDelete: 'CASCADE',
  })
  question: Cloze
}

@Entity()
export class Choice implements IChoice {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  key: string

  @Column()
  text: string

  @ManyToOne(() => MultipleChoice, question => question.choices, {
    onDelete: 'CASCADE',
  })
  question: MultipleChoice
}

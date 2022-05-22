import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as moment from 'moment'
import { CreateQuizInput, QuizSectionType } from 'src/graphql'
import { FindConditions, Repository } from 'typeorm'
import {
  ObjectiveQuizSection,
  QuizSection,
  SubjectiveQuizSection,
} from './entities/quiz-section.entity'
import { Quiz } from './entities/quiz.entity'

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
  ) {}

  create(input: CreateQuizInput) {
    if (!moment().diff(moment(input.start))) {
      throw new BadRequestException('Invalid input: bad "start" date')
    }
    const diff = moment(input.end).diff(moment(input.start))
    if (!diff) {
      throw new BadRequestException(
        'Invalid input, "end" date must come after "start"',
      )
    }
    if (diff <= input.duration) {
      throw new BadRequestException(
        'Invalid duration: adjust duration value, or  start and end dates',
      )
    }
    const newQuiz = this.quizRepo.create(input)
    newQuiz.sections = input.sections.map(sectionInput => {
      const newSection =
        sectionInput.sectionType === QuizSectionType.OBJECTIVE
          ? new ObjectiveQuizSection()
          : new SubjectiveQuizSection()
      newSection.description = sectionInput.description
      return newSection
    })
    return this.quizRepo.save(newQuiz)
  }

  findOneById(id: string) {
    return this.findOne({ id })
  }

  findAll() {
    return this.findMany()
  }

  private findOne(quiz: FindConditions<Quiz>) {
    return this.quizRepo.findOne(quiz)
  }

  private findMany(quizzes?: FindConditions<Quiz>) {
    return this.quizRepo.find(quizzes)
  }
}

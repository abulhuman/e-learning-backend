import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindCondition, FindConditions, Repository } from 'typeorm'
import { Cloze, MultipleChoice, Question } from '../entities/question.entity'

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(MultipleChoice)
    private multipleChoiceRepo: Repository<MultipleChoice>,
    @InjectRepository(Cloze) private clozeRepo: Repository<Cloze>,
  ) {}

  findOne(options: FindConditions<Question>, relations: string[] = []) {
    return this.questionRepo.findOne(options, { relations })
  }

  findAllForQuizSection(sectionId: string) {
    return this.questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.section', 'section')
      .where('section.id = :sectionId', { sectionId })
      .getMany()
  }
  findAllForQuiz(quizId: string) {
    return this.questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.section', 'section')
      .leftJoin('section.quiz', 'quiz')
      .where('quiz.id = :quizId', { quizId })
      .getMany()
  }
  async getQuestion(id: string, withAnswer = false) {
    const question = await this.questionRepo.findOne(id)
    if (question instanceof MultipleChoice) {
      return this.multipleChoiceRepo
        .findOne(question.id, { relations: ['choices'] })
        .then(question => {
          if (!withAnswer) {
            delete question.answer
          }
          return question
        })
    } else if (question instanceof Cloze) {
      return this.clozeRepo
        .findOne(question.id, { relations: ['subQuestions'] })
        .then(question => {
          if (!withAnswer) {
            question.subQuestions = question.subQuestions.map(sub => {
              delete sub.answer
              return sub
            })
            return question
          }
        })
    } else {
      let answer = question['answer']
      if (!withAnswer) {
        answer = undefined
      }
      return {
        ...question,
        answer,
      }
    }
  }
}

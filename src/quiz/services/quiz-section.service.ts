import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { QuizSection } from '../entities/quiz-section.entity'

@Injectable()
export class QuizSectionService {
  constructor(
    @InjectRepository(QuizSection) private sectionRepo: Repository<QuizSection>,
  ) {}

  async findAll() {
    const newLocal = await this.sectionRepo.find({ relations: ['quiz'] })
    return newLocal
  }

  async findOne(id: string) {
    return this.sectionRepo.findOne(id)
  }

  findAllForQuiz(quizId: string) {
    return this.sectionRepo
      .createQueryBuilder('section')
      .leftJoin('section.quiz', 'quiz')
      .where('quiz.id = :id', { id: quizId })
      .orderBy('section.created_at', 'ASC')
      .getMany()
  }
}

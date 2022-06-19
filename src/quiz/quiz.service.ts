import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as moment from 'moment'
import { CourseService } from 'src/course/course.service'
import {
  AnswerTrueFalse,
  CreateQuizInput,
  GradeAttemptInput,
  QuestionType,
  QuizSectionType,
} from 'src/graphql'
import { UsersService } from 'src/users/users.service'
import { FindConditions, Repository } from 'typeorm'
import {
  Choice,
  Cloze,
  Essay,
  MultipleChoice,
  SubQuestion,
  TrueFalse,
} from './entities/question.entity'
import { QuizAttempt } from './entities/quiz-attempt.entity'
import { QuizGrade } from './entities/quiz-grade.entity'
import {
  ObjectiveQuizSection,
  SubjectiveQuizSection,
} from './entities/quiz-section.entity'
import { Quiz } from './entities/quiz.entity'

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepo: Repository<QuizAttempt>,
    private userService: UsersService,
    @InjectRepository(QuizGrade)
    private gradeRepo: Repository<QuizGrade>,
    private courseService: CourseService,
  ) {}

  async create(input: CreateQuizInput) {
    const { courseId, ...quizInput } = input
    if (!moment().diff(moment(quizInput.start))) {
      throw new BadRequestException('Invalid input: bad "start" date')
    }
    const diff = moment(quizInput.end).diff(moment(quizInput.start))
    if (!diff) {
      throw new BadRequestException(
        'Invalid input, "end" date must come after "start"',
      )
    }
    if (diff <= quizInput.duration) {
      throw new BadRequestException(
        'Invalid duration: adjust duration value, or  start and end dates',
      )
    }
    const newQuiz = this.quizRepo.create(quizInput)
    newQuiz.course = await this.courseService.findOneCourse(courseId)
    newQuiz.maxScore = quizInput.maxScore
    newQuiz.sections = quizInput.sections.map(sectionInput => {
      const newSection =
        sectionInput.type === QuizSectionType.OBJECTIVE
          ? new ObjectiveQuizSection()
          : new SubjectiveQuizSection()
      newSection.description = sectionInput.description
      newSection.number = sectionInput.number
      newSection.questions = sectionInput.questions.map(questionInput => {
        if (sectionInput.type === QuizSectionType.OBJECTIVE) {
          if (
            questionInput.type !== QuestionType.TRUE_FALSE &&
            questionInput.type !== QuestionType.MULTIPLE_CHOICE
          ) {
            throw new BadRequestException(
              `Bad Question type, must be Objective question : ${questionText(
                questionInput.number,
                sectionInput.number,
              )}`,
            )
          }
        } else {
          if (
            questionInput.type !== QuestionType.CLOZE &&
            questionInput.type !== QuestionType.ESSAY
          ) {
            ;`Bad Question type, must be Subjective Question : ${questionText(
              questionInput.number,
              sectionInput.number,
            )}`
          }
        }
        switch (questionInput.type) {
          case QuestionType.TRUE_FALSE: {
            const { number, text, answer } = questionInput
            if (!answer) {
              throw new BadRequestException(
                `Missing 'answer' value : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            if (
              answer !== AnswerTrueFalse.TRUE &&
              answer !== AnswerTrueFalse.FALSE
            ) {
              throw new BadRequestException(
                `Invalid answer value. Must be 'TRUE' or 'FALSE' : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            const trueFalseQuestion = new TrueFalse()
            trueFalseQuestion.text = text
            trueFalseQuestion.number = number
            trueFalseQuestion.answer =
              answer === AnswerTrueFalse.TRUE
                ? AnswerTrueFalse.TRUE
                : AnswerTrueFalse.FALSE
            trueFalseQuestion.questionType = QuestionType.TRUE_FALSE
            return trueFalseQuestion
          }
          case QuestionType.ESSAY: {
            const { text, number, answer } = questionInput
            if (!answer) {
              throw new BadRequestException(
                `Missing 'answer' value : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            const essayQuestion = new Essay()
            essayQuestion.number = number
            essayQuestion.text = text
            essayQuestion.answer = answer
            essayQuestion.questionType = QuestionType.ESSAY
            return essayQuestion
          }
          case QuestionType.CLOZE: {
            const { number, text, subQuestions } = questionInput
            if (!subQuestions || !subQuestions.length) {
              throw new BadRequestException(
                `Missing sub questions : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            const clozeQuestion = new Cloze()
            clozeQuestion.number = number
            clozeQuestion.text = text
            clozeQuestion.subQuestions = subQuestions.map(subQuestionInput => {
              const { answer, number } = subQuestionInput
              const subQuestion = new SubQuestion()
              subQuestion.number = number
              subQuestion.answer = answer
              return subQuestion
            })
            clozeQuestion.questionType = QuestionType.CLOZE
            return clozeQuestion
          }
          case QuestionType.MULTIPLE_CHOICE: {
            const { number, text, answer, choices } = questionInput
            if (!answer) {
              throw new BadRequestException(
                `Missing 'answer' value : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            if (!choices || !choices.length) {
              throw new BadRequestException(
                `Missing choices : ${questionText}for question ${number} of section ${sectionInput.number}`,
              )
            }
            //answer text is one of the keys of the choices
            const answerIsInKeys = choices.some(choice => choice.key === answer)
            if (!answerIsInKeys) {
              throw new BadRequestException(
                `Question answer must be one of the choice : ${questionText(
                  number,
                  sectionInput.number,
                )}`,
              )
            }
            const multipleChoiceQuestion = new MultipleChoice()
            multipleChoiceQuestion.text = text
            multipleChoiceQuestion.number = number
            multipleChoiceQuestion.answer = answer
            multipleChoiceQuestion.choices = choices.map(choiceInput => {
              const choice = new Choice()
              choice.key = choiceInput.key
              choice.text = choiceInput.text
              return choice
            })
            multipleChoiceQuestion.questionType = QuestionType.MULTIPLE_CHOICE
            return multipleChoiceQuestion
          }
        }
      })
      return newSection
    })
    return this.quizRepo.save(newQuiz)
  }

  async gradeAttempt(input: GradeAttemptInput) {
    const attempt = await this.quizAttemptRepo.findOne({ id: input.attemptId })
    const marker = await this.userService.findOneUserById(input.markerId)

    const grade = this.gradeRepo.create({ attempt, marker, score: input.score })
    return this.gradeRepo.save(grade)
  }

  findOneById(id: string) {
    return this.findOne({ id }, [
      'sections',
      'sections.questions',
      'sections.questions.choices',
      'sections.questions.subQuestions',
    ])
  }

  findAll() {
    return this.findMany()
  }

  private findOne(quiz: FindConditions<Quiz>, relations: string[] = []) {
    return this.quizRepo.findOne(quiz, { relations })
  }

  private findMany(quizzes?: FindConditions<Quiz>) {
    return this.quizRepo.find(quizzes)
  }
}

function questionText(questionNumber: number, sectionNumber: number) {
  return `Question ${questionNumber} of Section ${sectionNumber}`
}

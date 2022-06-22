import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { createWriteStream } from 'fs'
import { FileUpload } from 'graphql-upload'
import { join } from 'path'
import { editFileName } from 'src/files/utils/file-upload.utils'
import { UsersService } from 'src/users/users.service'
import { pipeline } from 'stream'
import { Repository } from 'typeorm'
import { promisify } from 'util'
import { CreateAssignmentSubmissionInput } from '../dto/create-assignment-submission.input'
import { AssignmentCriterion } from '../entities/assignment-criterion.entity'
import { AssignmentSubmission } from '../entities/assignment-submission.entity'
import { AssignmentDefinitionService } from './assignment-definition.service'

const pipelinePromise = promisify(pipeline)
@Injectable()
export class AssignmentSubmissionService {
  constructor(
    @InjectRepository(AssignmentSubmission)
    private readonly assignmentSubmissionRepository: Repository<AssignmentSubmission>,
    @Inject(AssignmentDefinitionService)
    private readonly assignmentDefinitionService: AssignmentDefinitionService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}
  async createAssignmentSubmission(input: CreateAssignmentSubmissionInput) {
    const { submissionDate, definitionId, studentId, file } = input
    let assignmentSubmission =
      await this.assignmentSubmissionRepository.findOne({
        definition: {
          id: definitionId,
        },
        submittedBy: {
          id: studentId,
        },
      })
    if (assignmentSubmission === undefined) {
      assignmentSubmission = this.assignmentSubmissionRepository.create({
        submissionDate,
      })
      assignmentSubmission.definition =
        await this.assignmentDefinitionService.findOneAssignmentDefinition(
          definitionId,
        )
      assignmentSubmission.submittedBy =
        await this.usersService.findOneUserById(studentId, true)
    }

    const { createReadStream, filename }: FileUpload = await file
    const readStream = createReadStream()
    const newFilename = editFileName(filename)
    const writer = createWriteStream(
      join(__dirname, '../../upload', newFilename),
    )
    await pipelinePromise(readStream, writer)
    assignmentSubmission.submissionFile = newFilename
    return this.assignmentSubmissionRepository.save(assignmentSubmission)
  }
  findAllAssignmentSubmissions() {
    return this.assignmentSubmissionRepository.find({
      relations: [
        // 'submissionFile',
        'definition',
        'submittedBy',
        'values',
      ],
    })
  }
  async findOneAssignmentSubmission(id: string) {
    const assignmentSubmission =
      await this.assignmentSubmissionRepository.findOne(id, {
        relations: [
          // 'submissionFile',
          'definition',
          'definition.criteria',
          'submittedBy',
          'values',
          'values.criterion',
        ],
      })
    if (!assignmentSubmission)
      throw new NotFoundException(
        `Assignment submission with id: ${id} was not found.`,
      )
    return assignmentSubmission
  }
  async removeAssignmentSubmission(id: string) {
    const assignmentSubmissionToRemove = await this.findOneAssignmentSubmission(
      id,
    )
    return (
      this.assignmentSubmissionRepository
        .remove(assignmentSubmissionToRemove)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
  async gradeSubmission(id: string, totalScore = 0) {
    const submission = await this.findOneAssignmentSubmission(id)
    const { values, definition } = submission
    const { criteria } = definition
    let scoreSum = 0
    values.forEach(value => {
      scoreSum += value.score * value.criterion.weight
    })
    let weightedCriteriaSum = 0
    criteria.forEach((criterion: AssignmentCriterion) => {
      weightedCriteriaSum += criterion.weight * 6
    })
    submission.totalScore = definition.isCriteriaBased
      ? definition.maximumScore * (scoreSum / weightedCriteriaSum)
      : totalScore
    return this.assignmentSubmissionRepository.save(submission)
  }
  async gradeNormalSubmission(id: string, totalScore = 0) {
    const submission = await this.findOneAssignmentSubmission(id)
    Object.assign(submission, { totalScore })
    return this.assignmentSubmissionRepository.save(submission)
  }
}

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  AssignmentSubmissionService,
  AssignmentCriterionService,
} from '../assignment.service'
import { CreateCriterionValueInput } from '../dto/create-criterion-value.input'
import { UpdateCriterionValueInput } from '../dto/update-criterion-value.input'
import { CriterionValue } from '../entities/criterion-value.entity'

@Injectable()
export class CriterionValueService {
  private logger = new Logger(CriterionValue.name)
  constructor(
    @InjectRepository(CriterionValue)
    private readonly criterionValueRepository: Repository<CriterionValue>,
    @Inject(AssignmentCriterionService)
    private readonly assignmentCriterionService: AssignmentCriterionService,
    @Inject(AssignmentSubmissionService)
    private readonly assignmentSubmissionService: AssignmentSubmissionService,
  ) {}
  async createCriterionValue(
    createCriterionValueInput: CreateCriterionValueInput,
  ) {
    const { criterionId, submissionId } = createCriterionValueInput
    delete createCriterionValueInput.criterionId
    delete createCriterionValueInput.submissionId
    const newCriterionValue = this.criterionValueRepository.create(
      createCriterionValueInput,
    )
    const criterion =
      await this.assignmentCriterionService.findOneAssignmentCriterion(
        criterionId,
      )
    const submission =
      await this.assignmentSubmissionService.findOneAssignmentSubmission(
        submissionId,
      )

    newCriterionValue.criterion = criterion
    newCriterionValue.submission = submission

    // Object.assign(newCriterionValue, { criterion, submission })

    return await this.criterionValueRepository.save(newCriterionValue)
  }

  findAllCriterionValues(criterionId: string) {
    return this.criterionValueRepository.find({
      relations: ['criterion', 'submission', 'submission.values'],
      where: {
        criterion: {
          id: criterionId,
        },
      },
    })
  }
  async findOneCriterionValue(id: string) {
    const criterionValue = await this.criterionValueRepository.findOne(id, {
      relations: ['definition'],
    })
    if (!criterionValue)
      throw new NotFoundException(
        `Assignment criterion with id: ${id} was not found.`,
      )
    return criterionValue
  }
  async updateCriterionValue(
    id: string,
    updateCriterionValueInput: UpdateCriterionValueInput,
  ) {
    const assignmentCriterionToUpdate = await this.findOneCriterionValue(id)
    for (const key in updateCriterionValueInput)
      if (!updateCriterionValueInput[key]) delete updateCriterionValueInput[key]

    Object.assign(assignmentCriterionToUpdate, updateCriterionValueInput)
    return this.criterionValueRepository.save(assignmentCriterionToUpdate)
  }

  async removeCriterionValue(id: string) {
    const criterionValueToRemove = await this.findOneCriterionValue(id)
    return (
      this.criterionValueRepository
        .remove(criterionValueToRemove)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
}

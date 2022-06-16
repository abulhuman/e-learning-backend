import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateAssignmentCriterionInput } from '../dto/create-assignment-criterion.input'
import { UpdateAssignmentCriterionInput } from '../dto/update-assignment-criterion.input'
import { AssignmentCriterion } from '../entities/assignment-criterion.entity'
import { AssignmentDefinitionService } from './assignment-definition.service'

@Injectable()
export class AssignmentCriterionService {
  private logger = new Logger(AssignmentCriterion.name)
  constructor(
    @InjectRepository(AssignmentCriterion)
    private readonly assignmentCriterionRepository: Repository<AssignmentCriterion>,
    @Inject(AssignmentDefinitionService)
    private readonly assignmentDefinitionService: AssignmentDefinitionService,
  ) {}
  async createAssignmentCriterion(
    createAssignmentCriterionInput: CreateAssignmentCriterionInput,
  ) {
    const { definitionId } = createAssignmentCriterionInput
    delete createAssignmentCriterionInput.definitionId
    const newAssignmentCriterion = this.assignmentCriterionRepository.create(
      createAssignmentCriterionInput,
    )
    const definition =
      await this.assignmentDefinitionService.findOneAssignmentDefinition(
        definitionId,
      )

    Object.assign(newAssignmentCriterion, { definition })

    return await this.assignmentCriterionRepository.save(newAssignmentCriterion)
  }

  findAllAssignmentCriteria(assignmentDefinitionId: string) {
    return this.assignmentCriterionRepository.find({
      relations: ['definition'],
      where: {
        definition: {
          id: assignmentDefinitionId,
        },
      },
    })
  }
  async findOneAssignmentCriterion(id: string) {
    const assignmentCriterion =
      await this.assignmentCriterionRepository.findOne(id, {
        relations: ['definition'],
      })
    if (!assignmentCriterion)
      throw new NotFoundException(
        `Assignment criterion with id: ${id} was not found.`,
      )
    return assignmentCriterion
  }
  async updateAssignmentCriterion(
    id: string,
    updateAssignmentCriterionInput: UpdateAssignmentCriterionInput,
  ) {
    const assignmentCriterionToUpdate = await this.findOneAssignmentCriterion(
      id,
    )
    for (const key in updateAssignmentCriterionInput)
      if (!updateAssignmentCriterionInput[key])
        delete updateAssignmentCriterionInput[key]

    Object.assign(assignmentCriterionToUpdate, updateAssignmentCriterionInput)
    return this.assignmentCriterionRepository.save(assignmentCriterionToUpdate)
  }

  async removeAssignmentCriterion(id: string) {
    const assignmentCriterionToRemove = await this.findOneAssignmentCriterion(
      id,
    )
    return (
      this.assignmentCriterionRepository
        .remove(assignmentCriterionToRemove)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
}

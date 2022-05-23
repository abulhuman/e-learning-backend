import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseService } from 'src/course/course.service'
import { Repository } from 'typeorm'
import { CreateAssignmentDefinitionInput } from '../dto/create-assignment-definition.input'
import { UpdateAssignmentDefinitionInput } from '../dto/update-assignment-definition.input'
import { AssignmentDefinition } from '../entities/assignment-definition.entity'

@Injectable()
export class AssignmentDefinitionService {
  constructor(
    @InjectRepository(AssignmentDefinition)
    private readonly assignmentDefinitionRepository: Repository<AssignmentDefinition>,
    @Inject(CourseService)
    private readonly courseService: CourseService,
  ) {}
  async createAssignmentDefinition(
    createAssignmentDefinitionInput: CreateAssignmentDefinitionInput,
  ) {
    const { courseId, instructionsFileId } = createAssignmentDefinitionInput
    delete createAssignmentDefinitionInput.courseId
    delete createAssignmentDefinitionInput.instructionsFileId
    const newAssignmentDefinition = this.assignmentDefinitionRepository.create(
      createAssignmentDefinitionInput,
    )
    const course = await this.courseService.findOneCourse(courseId)

    const instructionsFile = await this.courseService.findOneCourseDocument(
      instructionsFileId,
    )

    Object.assign(newAssignmentDefinition, { course, instructionsFile })

    return this.assignmentDefinitionRepository.save(newAssignmentDefinition)
  }
  findAllAssignmentDefinitions(courseId: string) {
    return this.assignmentDefinitionRepository.find({
      relations: ['course', 'instructionsFile', 'submissions'],
      where: {
        course: {
          id: courseId,
        },
      },
    })
  }
  async findOneAssignmentDefinition(id: string) {
    const assignmentDefinition =
      await this.assignmentDefinitionRepository.findOne(id, {
        relations: ['course', 'instructionsFile', 'submissions'],
      })
    if (!assignmentDefinition)
      throw new NotFoundException(
        `Assignment definition with id: ${id} was not found.`,
      )
    return assignmentDefinition
  }
  async updateAssignmentDefinition(
    id: string,
    updateAssignmentDefinitionInput: UpdateAssignmentDefinitionInput,
  ) {
    const assignmentDefinitionToUpdate = await this.findOneAssignmentDefinition(
      id,
    )
    for (const key in updateAssignmentDefinitionInput)
      if (!updateAssignmentDefinitionInput[key])
        delete updateAssignmentDefinitionInput[key]
    const { instructionsFileId } = updateAssignmentDefinitionInput
    delete updateAssignmentDefinitionInput.instructionsFileId

    const instructionsFileToReplace =
      await this.courseService.findOneCourseDocument(instructionsFileId)
    Object.assign(assignmentDefinitionToUpdate, {
      ...updateAssignmentDefinitionInput,
      instructionsFile: instructionsFileToReplace,
    })
    return this.assignmentDefinitionRepository.save(
      assignmentDefinitionToUpdate,
    )
  }

  async removeAssignmentDefinition(id: string) {
    const assignmentDefinitionToRemove = await this.findOneAssignmentDefinition(
      id,
    )
    return (
      this.assignmentDefinitionRepository
        .remove(assignmentDefinitionToRemove)
        .then(res => {
          return !!res
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .catch(_err => false)
    )
  }
}

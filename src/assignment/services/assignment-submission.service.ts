import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CourseService } from 'src/course/course.service'
import { UsersService } from 'src/users/users.service'
import { Repository } from 'typeorm'
import { CreateAssignmentSubmissionInput } from '../dto/create-assignment-submission.input'
import { UpdateAssignmentSubmissionInput } from '../dto/update-assignment-submission.input'
import { AssignmentSubmission } from '../entities/assignment-submission.entity'
import { AssignmentDefinitionService } from './assignment-definition.service'

@Injectable()
export class AssignmentSubmissionService {
  constructor(
    @InjectRepository(AssignmentSubmission)
    private readonly assignmentSubmissionRepository: Repository<AssignmentSubmission>,
    @Inject(AssignmentDefinitionService)
    private readonly assignmentDefinitionService: AssignmentDefinitionService,
    @Inject(CourseService)
    private readonly courseService: CourseService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}
  async createAssignmentSubmission(
    createAssignmentSubmissionInput: CreateAssignmentSubmissionInput,
  ) {
    const { definitionId, studentId, submissionFileId, replaceFile } =
      createAssignmentSubmissionInput

    delete createAssignmentSubmissionInput.definitionId
    delete createAssignmentSubmissionInput.studentId
    delete createAssignmentSubmissionInput.submissionFileId
    delete createAssignmentSubmissionInput.replaceFile

    const definition =
      await this.assignmentDefinitionService.findOneAssignmentDefinition(
        definitionId,
      )
    const submittedBy = await this.usersService.findOneUserById(studentId, true)
    let submissionFile = await this.courseService.findOneCourseDocument(
      submissionFileId,
    )

    // logic to delete old submission and document incase `replaceFile` is true
    // this ensures that the submission is replaced with a new submission and
    // new document association
    if (submissionFile.assignmentSubmission) {
      if (!replaceFile)
        throw new BadRequestException(
          `The document you're trying to submit is already attached to an assignment. Try agian with the @param 'replaceFile' = true`,
        )
      else {
        this.removeAssignmentSubmission(submissionFile.assignmentSubmission.id)
        submissionFile.assignmentSubmission = null
        submissionFile = await this.courseService.updateCourseDocument(
          submissionFile.id,
          {
            ...submissionFile,
          },
        )
      }
    }

    const newAssignmentSubmission = this.assignmentSubmissionRepository.create(
      createAssignmentSubmissionInput,
    )
    Object.assign(newAssignmentSubmission, {
      submissionFile,
      definition,
      submittedBy,
    })
    return this.assignmentSubmissionRepository.save(newAssignmentSubmission)
  }
  findAllAssignmentSubmissions() {
    return this.assignmentSubmissionRepository.find({
      relations: ['submissionFile', 'definition', 'submittedBy'],
    })
  }
  async findOneAssignmentSubmission(id: string) {
    const assignmentSubmission =
      await this.assignmentSubmissionRepository.findOne(id, {
        relations: ['submissionFile', 'definition', 'submittedBy'],
      })
    if (!assignmentSubmission)
      throw new NotFoundException(
        `Assignment submission with id: ${id} was not found.`,
      )
    return assignmentSubmission
  }
  async updateAssignmentSubmission(
    id: string,
    updateAssignmentSubmissionInput: UpdateAssignmentSubmissionInput,
  ) {
    const submissionToUpdate = await this.findOneAssignmentSubmission(id)
    for (const key in updateAssignmentSubmissionInput)
      if (!updateAssignmentSubmissionInput[key])
        delete updateAssignmentSubmissionInput[key]
    const { submissionFileId, replaceFile } = updateAssignmentSubmissionInput
    delete updateAssignmentSubmissionInput.submissionFileId
    delete updateAssignmentSubmissionInput.replaceFile

    let submissionFileToReplace =
      await this.courseService.findOneCourseDocument(submissionFileId)

    // logic to delete old submission and document incase `replaceFile` is true
    // this ensures that the submission is replaced with a new submission and
    // new document association
    if (submissionFileToReplace.assignmentSubmission) {
      if (!replaceFile)
        throw new BadRequestException(
          `The document you're trying to submit is already attached to an assignment. Try agian with the @param 'replaceFile' = true`,
        )
      else {
        this.removeAssignmentSubmission(
          submissionFileToReplace.assignmentSubmission.id,
        )
        submissionFileToReplace.assignmentSubmission = null
        submissionFileToReplace = await this.courseService.updateCourseDocument(
          submissionFileToReplace.id,
          {
            ...submissionFileToReplace,
          },
        )
      }
    }
    Object.assign(submissionToUpdate, {
      ...updateAssignmentSubmissionInput,
      submissionFile: submissionFileToReplace,
    })
    return this.assignmentSubmissionRepository.save(submissionToUpdate)
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
}

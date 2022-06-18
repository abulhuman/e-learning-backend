import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AssignmentSubmissionService } from '../assignment.service'
import { CreateAssignmentSubmissionInput } from '../dto/create-assignment-submission.input'
import { UpdateAssignmentSubmissionInput } from '../dto/update-assignment-submission.input'

@Resolver('AssignmentSubmission')
export class AssignmentSubmissionResolver {
  constructor(
    private readonly assignmentSubmissionService: AssignmentSubmissionService,
  ) {}

  @Mutation('createAssignmentSubmission')
  create(
    @Args('createAssignmentSubmissionInput')
    createAssignmentSubmissionInput: CreateAssignmentSubmissionInput,
  ) {
    return this.assignmentSubmissionService.createAssignmentSubmission(
      createAssignmentSubmissionInput,
    )
  }

  @Query('assignmentSubmissions')
  findAll() {
    return this.assignmentSubmissionService.findAllAssignmentSubmissions()
  }

  @Query('assignmentSubmission')
  findOne(@Args('id') id: string) {
    return this.assignmentSubmissionService.findOneAssignmentSubmission(id)
  }

  @Mutation('updateAssignmentSubmission')
  update(
    @Args('updateAssignmentSubmissionInput')
    updateAssignmentSubmissionInput: UpdateAssignmentSubmissionInput,
  ) {
    return this.assignmentSubmissionService.updateAssignmentSubmission(
      updateAssignmentSubmissionInput.id,
      updateAssignmentSubmissionInput,
    )
  }

  @Mutation('removeAssignmentSubmission')
  remove(@Args('id') id: string) {
    return this.assignmentSubmissionService.removeAssignmentSubmission(id)
  }
}

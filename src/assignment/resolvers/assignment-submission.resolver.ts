import { ParseFloatPipe, ParseUUIDPipe } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { AssignmentSubmissionService } from '../assignment.service'
import { CreateAssignmentSubmissionInput } from '../dto/create-assignment-submission.input'
import { AssignmentSubmission } from '../entities/assignment-submission.entity'

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

  @Mutation('removeAssignmentSubmission')
  remove(@Args('id', ParseUUIDPipe) id: string) {
    return this.assignmentSubmissionService.removeAssignmentSubmission(id)
  }

  @Mutation('gradeSubmission')
  grade(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('totalScore', ParseFloatPipe) totalScore: number,
  ) {
    return this.assignmentSubmissionService.gradeSubmission(id, totalScore)
  }

  @ResolveField('values')
  async values(@Parent() submission: AssignmentSubmission) {
    return (
      await this.assignmentSubmissionService.findOneAssignmentSubmission(
        submission.id,
      )
    ).values
  }
}

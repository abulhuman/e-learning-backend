import { ParseFloatPipe, ParseUUIDPipe } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { saveFile } from 'src/files/utils/file-upload.utils'
import { AssignmentSubmissionService } from '../assignment.service'
import { CreateAssignmentSubmissionInput } from '../dto/create-assignment-submission.input'
import { AssignmentSubmission } from '../entities/assignment-submission.entity'

@Resolver('AssignmentSubmission')
export class AssignmentSubmissionResolver {
  constructor(
    private readonly assignmentSubmissionService: AssignmentSubmissionService,
  ) {}

  @Mutation('createAssignmentSubmission')
  async create(
    @Args('createAssignmentSubmissionInput')
    input: CreateAssignmentSubmissionInput,
  ) {
    const { file, ...rest } = input
    const newFileName = await saveFile(file)
    return this.assignmentSubmissionService.createAssignmentSubmission(
      rest,
      newFileName,
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

  @Mutation('gradeNormalSubmission')
  gradeNormal(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('totalScore', ParseFloatPipe) totalScore: number,
  ) {
    return this.assignmentSubmissionService.gradeNormalSubmission(
      id,
      totalScore,
    )
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

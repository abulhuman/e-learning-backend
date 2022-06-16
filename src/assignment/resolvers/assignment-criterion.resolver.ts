import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AssignmentCriterionService } from '../assignment.service'
import { CreateAssignmentCriterionInput } from '../dto/create-assignment-criterion.input'
import { UpdateAssignmentCriterionInput } from '../dto/update-assignment-criterion.input'

@Resolver('AssignmentCriterion')
export class AssignmentCriterionResolver {
  constructor(
    private readonly assignmentCriterionService: AssignmentCriterionService,
  ) {}

  @Mutation('createAssignmentCriterion')
  create(
    @Args('createAssignmentCriterionInput')
    createAssignmentCriterionInput: CreateAssignmentCriterionInput,
  ) {
    return this.assignmentCriterionService.createAssignmentCriterion(
      createAssignmentCriterionInput,
    )
  }

  @Query('assignmentCriteria')
  findAll(
    @Args('assignmentDefinitionId', ParseUUIDPipe)
    assignmentDefinitionId: string,
  ) {
    return this.assignmentCriterionService.findAllAssignmentCriteria(
      assignmentDefinitionId,
    )
  }

  @Query('assignmentCriterion')
  findOne(@Args('id') id: string) {
    return this.assignmentCriterionService.findOneAssignmentCriterion(id)
  }

  @Mutation('updateAssignmentCriterion')
  update(
    @Args('updateAssignmentCriterionInput')
    updateAssignmentCriterionInput: UpdateAssignmentCriterionInput,
  ) {
    return this.assignmentCriterionService.updateAssignmentCriterion(
      updateAssignmentCriterionInput.id,
      updateAssignmentCriterionInput,
    )
  }

  @Mutation('removeAssignmentCriterion')
  remove(@Args('id', ParseUUIDPipe) id: string) {
    return this.assignmentCriterionService.removeAssignmentCriterion(id)
  }
}

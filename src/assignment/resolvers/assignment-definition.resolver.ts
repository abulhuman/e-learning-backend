import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AssignmentDefinitionService } from '../assignment.service'
import { CreateAssignmentDefinitionInput } from '../dto/create-assignment-definition.input'
import { UpdateAssignmentDefinitionInput } from '../dto/update-assignment-definition.input'

@Resolver('AssignmentDefinition')
export class AssignmentDefinitionResolver {
  constructor(
    private readonly assignmentDefinitionService: AssignmentDefinitionService,
  ) {}

  @Mutation('createAssignmentDefinition')
  create(
    @Args('createAssignmentDefinitionInput')
    createAssignmentDefinitionInput: CreateAssignmentDefinitionInput,
  ) {
    return this.assignmentDefinitionService.createAssignmentDefinition(
      createAssignmentDefinitionInput,
    )
  }

  @Query('assignmentDefinitions')
  findAll(@Args('courseId', ParseUUIDPipe) courseId: string) {
    return this.assignmentDefinitionService.findAllAssignmentDefinitions(
      courseId,
    )
  }

  @Query('assignmentDefinition')
  findOne(@Args('id') id: string) {
    return this.assignmentDefinitionService.findOneAssignmentDefinition(id)
  }

  @Mutation('updateAssignmentDefinition')
  update(
    @Args('updateAssignmentDefinitionInput')
    updateAssignmentDefinitionInput: UpdateAssignmentDefinitionInput,
  ) {
    return this.assignmentDefinitionService.updateAssignmentDefinition(
      updateAssignmentDefinitionInput.id,
      updateAssignmentDefinitionInput,
    )
  }

  @Mutation('removeAssignmentDefinition')
  remove(@Args('id') id: string) {
    return this.assignmentDefinitionService.removeAssignmentDefinition(id)
  }
}

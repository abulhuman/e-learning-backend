import { ParseUUIDPipe } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CriterionValueService } from '../assignment.service'
import { CreateCriterionValueInput } from '../dto/create-criterion-value.input'
import { UpdateCriterionValueInput } from '../dto/update-criterion-value.input'

@Resolver('CriterionValue')
export class CriterionValueResolver {
  constructor(private readonly criterionValueService: CriterionValueService) {}

  @Mutation('createCriterionValue')
  create(
    @Args('createCriterionValueInput')
    createCriterionValueInput: CreateCriterionValueInput,
  ) {
    return this.criterionValueService.createCriterionValue(
      createCriterionValueInput,
    )
  }

  @Query('criterionValues')
  findAll(
    @Args('criterionId', ParseUUIDPipe)
    criterionId: string,
  ) {
    return this.criterionValueService.findAllCriterionValues(criterionId)
  }

  @Query('criterionValue')
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.criterionValueService.findOneCriterionValue(id)
  }

  @Mutation('updateCriterionValue')
  update(
    @Args('updateCriterionValueInput')
    updateCriterionValueInput: UpdateCriterionValueInput,
  ) {
    return this.criterionValueService.updateCriterionValue(
      updateCriterionValueInput.id,
      updateCriterionValueInput,
    )
  }

  @Mutation('removeCriterionValue')
  remove(@Args('id', ParseUUIDPipe) id: string) {
    return this.criterionValueService.removeCriterionValue(id)
  }
}

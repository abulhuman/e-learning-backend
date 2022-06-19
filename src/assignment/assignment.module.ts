import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CourseModule } from 'src/course/course.module'
import { CourseService } from 'src/course/course.service'
import { Chapter } from 'src/course/entities/chapter.entity'
import { CourseDocument } from 'src/course/entities/course-document.entity'
import { Course } from 'src/course/entities/course.entity'
import { SubChapter } from 'src/course/entities/sub-chapter.entity'
import { MailModule } from 'src/mail/mail.module'
import { TelegramModule } from 'src/telegram/telegram.module'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'
import { UsersModule } from 'src/users/users.module'
import {
  AssignmentDefinitionResolver,
  AssignmentSubmissionResolver,
  AssignmentCriterionResolver,
  CriterionValueResolver,
} from './assignment.resolver'
import {
  AssignmentDefinitionService,
  AssignmentSubmissionService,
  AssignmentCriterionService,
  CriterionValueService,
} from './assignment.service'
import { AssignmentCriterion } from './entities/assignment-criterion.entity'
import { AssignmentDefinition } from './entities/assignment-definition.entity'
import { AssignmentSubmission } from './entities/assignment-submission.entity'
import { CriterionValue } from './entities/criterion-value.entity'

@Module({
  imports: [
    forwardRef(() => CourseModule),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([
      AssignmentDefinition,
      AssignmentSubmission,
      AssignmentCriterion,
      CriterionValue,
      Course,
      Chapter,
      SubChapter,
      CourseDocument,
      User,
      StudentClass,
    ]),
    forwardRef(() => TelegramModule),
    MailModule,
  ],
  providers: [
    AssignmentDefinitionResolver,
    AssignmentSubmissionResolver,
    AssignmentCriterionResolver,
    CriterionValueResolver,
    AssignmentDefinitionService,
    AssignmentSubmissionService,
    AssignmentCriterionService,
    CriterionValueService,
  ],
  exports: [AssignmentSubmissionService],
})
export class AssignmentModule {}

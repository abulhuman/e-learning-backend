import { forwardRef, Module } from '@nestjs/common'
import {
  AssignmentDefinitionService,
  AssignmentSubmissionService,
} from './assignment.service'
import {
  AssignmentDefinitionResolver,
  AssignmentSubmissionResolver,
} from './assignment.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssignmentDefinition } from './entities/assignment-definition.entity'
import { AssignmentSubmission } from './entities/assignment-submission.entity'
import { CourseService } from 'src/course/course.service'
import { CourseModule } from 'src/course/course.module'
import { Course } from 'src/course/entities/course.entity'
import { Chapter } from 'src/course/entities/chapter.entity'
import { SubChapter } from 'src/course/entities/sub-chapter.entity'
import { CourseDocument } from 'src/course/entities/course-document.entity'
import { User } from 'src/users/entities/user.entity'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    forwardRef(() => CourseModule),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([
      AssignmentDefinition,
      AssignmentSubmission,
      Course,
      Chapter,
      SubChapter,
      CourseDocument,
      User,
    ]),
  ],
  providers: [
    AssignmentDefinitionResolver,
    AssignmentSubmissionResolver,
    AssignmentDefinitionService,
    AssignmentSubmissionService,
    CourseService,
  ],
  exports: [CourseService],
})
export class AssignmentModule {}

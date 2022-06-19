import { forwardRef, Module } from '@nestjs/common'
import { CourseService } from './course.service'
import {
  CourseResolver,
  ChapterResolver,
  CourseDocumentResolver,
} from './course.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AssignmentModule } from 'src/assignment/assignment.module'
import { NotificationModule } from 'src/notification/notification.module'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'
import { UsersModule } from 'src/users/users.module'
import { Chapter } from './entities/chapter.entity'
import { CourseDocument } from './entities/course-document.entity'
import { Course } from './entities/course.entity'
import { SubChapter } from './entities/sub-chapter.entity'

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([
      Course,
      Chapter,
      SubChapter,
      CourseDocument,
      StudentClass,
      User,
    ]),
    forwardRef(() => NotificationModule),
    forwardRef(() => AssignmentModule),
  ],
  providers: [
    CourseResolver,
    ChapterResolver,
    CourseDocumentResolver,
    CourseService,
  ],
  exports: [CourseService],
})
export class CourseModule {}

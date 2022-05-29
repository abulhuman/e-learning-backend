import { forwardRef, Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseResolver } from './course.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from './entities/course.entity'
import { SubChapter } from './entities/sub-chapter.entity'
import { Chapter } from './entities/chapter.entity'
import { CourseDocument } from './entities/course-document.entity'
import { UsersModule } from 'src/users/users.module'
import { NotificationModule } from 'src/notification/notification.module'
import { AssignmentModule } from 'src/assignment/assignment.module'
import { StudentClass } from 'src/users/entities/student-class.entity'
import { User } from 'src/users/entities/user.entity'

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Course,
      Chapter,
      SubChapter,
      CourseDocument,
      StudentClass,
      User,
    ]),
    NotificationModule,
    forwardRef(() => AssignmentModule),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}

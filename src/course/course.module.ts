import { forwardRef, Module } from '@nestjs/common'
import { CourseService } from './course.service'
import {
  CourseResolver,
  ChapterResolver,
  CourseDocumentResolver,
} from './course.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from './entities/course.entity'
import { SubChapter } from './entities/sub-chapter.entity'
import { Chapter } from './entities/chapter.entity'
import { CourseDocument } from './entities/course-document.entity'
import { UsersModule } from 'src/users/users.module'
import { NotificationModule } from 'src/notification/notification.module'
import { AssignmentModule } from 'src/assignment/assignment.module'

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Course, Chapter, SubChapter, CourseDocument]),
    NotificationModule,
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

import { Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseResolver } from './course.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from './entities/course.entity'
import { SubChapter } from './entities/sub-chapter.entity'
import { Chapter } from './entities/chapter.entity'
import { CourseDocument } from './entities/course-document.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Chapter, SubChapter, CourseDocument]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}

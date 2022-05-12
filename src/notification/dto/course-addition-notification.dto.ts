import { Course } from 'src/course/entities/course.entity'
import { Notification } from '../entities/notification.entity'

export interface CourseAdditionNotification extends Notification {
  course: Course
}

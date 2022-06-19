import { Course } from 'src/course/entities/course.entity'
import { Notification } from '../entities/notification.entity'

export interface CourseNotification extends Notification {
  course: Course
}

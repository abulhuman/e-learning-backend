import { StudentClass } from 'src/users/entities/student-class.entity'
import { CourseNotification } from './course-notification.dto'

export interface ClassCourseNotification extends CourseNotification {
  studentClass: StudentClass
}

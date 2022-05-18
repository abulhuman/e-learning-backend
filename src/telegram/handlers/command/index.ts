import { LogoutCommandHander } from './logout.command.handler'
import { MyCoursesCommandHandler } from './myCourses.command.handler'
import { StartCommandHandler } from './start.command.handler'
import { UnknownCommandHandler } from './unknown.command.handler'

export const commandHandlers = [
  StartCommandHandler,
  UnknownCommandHandler,
  MyCoursesCommandHandler,
  LogoutCommandHander,
]

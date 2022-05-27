import { LogoutCommandHander } from './logout.command.handler'
import { MyCoursesCommandHandler } from './myCourses.command.handler'
import { StartCommandHandler } from './start.command.handler'
import { SubmitCommandHandler } from './submit.command.handler'
import { UnknownCommandHandler } from './unknown.command.handler'

export const commandHandlers = [
  StartCommandHandler,
  UnknownCommandHandler,
  SubmitCommandHandler,
  MyCoursesCommandHandler,
  LogoutCommandHander,
]

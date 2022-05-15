import { StartCommandHandler } from './start.command.handler'
import { UnknownCommandHandler } from './unknown.command.handler'

export const commandHandlers = [StartCommandHandler, UnknownCommandHandler]

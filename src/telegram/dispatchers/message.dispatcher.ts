import { Injectable } from '@nestjs/common'
import { MessageEntity, MessageUpdate } from '../dtos'
import { MyCoursesCommandHandler } from '../handlers/command/myCourses.command.handler'
import { StartCommandHandler } from '../handlers/command/start.command.handler'
import { UnknownCommandHandler } from '../handlers/command/unknown.command.handler'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { Command, MessageEntityType } from '../telegram.constants'

@Injectable()
export class MessageDispatcher implements Dispatcher {
  constructor(
    private startCommandHandler: StartCommandHandler,
    private mycoursesCommandHandler: MyCoursesCommandHandler,
    private unknownCommandHandler: UnknownCommandHandler,
  ) {}
  dispatch(update: MessageUpdate) {
    const { message } = update
    let commandEntity: MessageEntity
    if (
      (commandEntity = update.message.entities.find(
        update => update.type === MessageEntityType.COMMAND,
      ))
    ) {
      const rawCommand = update.message.text.substring(
        commandEntity.offset,
        commandEntity.length,
      )
      const [command, ...payload] = rawCommand.split(' ')

      switch (command) {
        case Command.START:
          this.startCommandHandler.handle(message, payload)
          break
        case Command.MY_COURSES:
          this.mycoursesCommandHandler.handle(message)
          break
        default:
          this.unknownCommandHandler.handle(message, command)
          break
      }
    }
  }
}

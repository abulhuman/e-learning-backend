import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { from, switchMap } from 'rxjs'
import { AppService } from 'src/app/app.service'
import { AssignmentDefinitionService } from 'src/assignment/assignment.service'
import { CallbackQuery, TextMessage } from 'src/telegram/dtos'
import { Handler } from 'src/telegram/interfaces/hanlder.interface'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class InstructionsCallbackHandler implements Handler {
  private logger = new Logger(InstructionsCallbackHandler.name)
  constructor(
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    @Inject(forwardRef(() => AssignmentDefinitionService))
    private assignmentDefinitionService: AssignmentDefinitionService,
    private appService: AppService,
  ) {}
  handle(query: CallbackQuery, assignmentId: string) {
    const { message } = query
    return from(
      this.assignmentDefinitionService.findOneAssignmentDefinition(
        assignmentId,
      ),
    )
      .pipe(
        switchMap(assignment => {
          if (assignment === undefined) {
            return this.telegramService.sendMessage({
              text: 'Error finding assignment',
              chat_id: message.chat.id,
            })
          } else {
            return this.telegramService
              .answerCallbackQuery({
                callback_query_id: query.id,
                text: `Sending instructions file for ${assignment.name}`,
              })
              .pipe(
                switchMap(() =>
                  this.telegramService.sendDocument({
                    chat_id: message.chat.id,
                    document: `${this.appService.appUrl}/upload/${assignment.instructionsFile}`,
                  }),
                ),
              )
          }
        }),
      )
      .subscribe({
        error: error => {
          this.logger.error(error)
          this.telegramService.sendMessage({
            text: 'Error downloading files',
            chat_id: message.chat.id,
          })
        },
      })
  }
}

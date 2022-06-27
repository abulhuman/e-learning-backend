import { forwardRef, Inject, Injectable } from '@nestjs/common'
import {
  CallbackQueryUpdate,
  FileMessage,
  Message,
  MessageUpdate,
  TextMessage,
  Update,
} from '../dtos'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { CallbackDispatcher } from './callback.dispatcher'
import { FileDispatcher } from './file.dispatcher'
import { MessageDispatcher } from './message.dispatcher'

@Injectable()
export class UpdateDispatcher implements Dispatcher {
  constructor(
    @Inject(forwardRef(() => MessageDispatcher))
    private messageDispatcher: MessageDispatcher,
    @Inject(forwardRef(() => CallbackDispatcher))
    private callbackDispatcher: CallbackDispatcher,
    @Inject(forwardRef(() => FileDispatcher))
    private fileDispatcher: FileDispatcher,
  ) {}
  dispatch(updates: Update[]): void {
    updates.forEach(update => {
      if (update.hasOwnProperty('message')) {
        const messageUpdate = update as MessageUpdate<Message>
        if (messageUpdate.message.hasOwnProperty('document')) {
          this.fileDispatcher.dispatch(
            messageUpdate as MessageUpdate<FileMessage>,
          )
        } else if (messageUpdate.message.hasOwnProperty('text')) {
          this.messageDispatcher.dispatch(
            messageUpdate as MessageUpdate<TextMessage>,
          )
        }
      } else if (update.hasOwnProperty('callback_query')) {
        this.callbackDispatcher.dispatch(update as CallbackQueryUpdate)
      }
    })
  }
}

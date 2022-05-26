import { forwardRef, Inject, Injectable } from '@nestjs/common'
import {
  CallbackQueryUpdate,
  Message,
  MessageUpdate,
  TextMessage,
  Update,
} from '../dtos'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { CallbackDispatcher } from './callback.dispatcher'
import { MessageDispatcher } from './message.dispatcher'

@Injectable()
export class UpdateDispatcher implements Dispatcher {
  constructor(
    @Inject(forwardRef(() => MessageDispatcher))
    private messageDispatcher: MessageDispatcher,
    @Inject(forwardRef(() => CallbackDispatcher))
    private callbackDispatcher: CallbackDispatcher,
  ) {}
  dispatch(updates: Update[]): void {
    updates.forEach(update => {
      if (update.hasOwnProperty('message')) {
        const messageUpdate = update as MessageUpdate<Message>
        if (messageUpdate.hasOwnProperty('text')) {
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

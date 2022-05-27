import { CallbackDispatcher } from './callback.dispatcher'
import { FileDispatcher } from './file.dispatcher'
import { MessageDispatcher } from './message.dispatcher'
import { UpdateDispatcher } from './update.dispatcher'

export const dispatchers = [
  MessageDispatcher,
  UpdateDispatcher,
  CallbackDispatcher,
  FileDispatcher,
]

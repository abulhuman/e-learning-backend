import { TelegramAccount } from '../entities/telegram-account.entity'
import {
  BotCommandScopeType,
  ChatType,
  MessageEntityType,
} from '../telegram.constants'

export class Update {
  update_id: number
  type: string
}

export class MessageUpdate<T extends Message> extends Update {
  message: T
}

export class CallbackQueryUpdate extends Update {
  callback_query: CallbackQuery
}

export interface MessageEntity {
  type: MessageEntityType
  offset: number
  length: number
  url?: string
  language?: string
}

export interface Message {
  message_id: string
  date: string
  chat: Chat
  from?: TelegramAccount
}
export interface TextMessage extends Message {
  text: string
  entities?: MessageEntity[]
}

export interface Document {
  file_id: string
  file_unique_id: string
  file_name?: string
  file_size?: number
  mime_type?: string
}

export interface File {
  file_id: string
  file_unique_id: string
  file_size?: number
  file_path?: string
}
export interface FileMessage extends Message {
  document: Document
}

export interface Chat {
  id: string
  type: ChatType
  title?: string
  username?: string
}
export interface ChatMember {
  status:
    | 'creator'
    | 'administrator'
    | 'member'
    | 'restricted'
    | 'left'
    | 'kicked'
  user: TelegramAccount
}
export interface BotCommand {
  command: string
  description: string
}

export interface CallbackQuery {
  id: string
  from: TelegramAccount
  message?: TextMessage
  chat_instance: string
  data?: string
}

export interface MenuButton {
  type: 'commands' | 'web_app' | 'default'
  text?: string
}

export interface BotCommandScope {
  type: BotCommandScopeType
  chat_id?: string
  user_id?: string
}

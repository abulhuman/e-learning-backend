import { TelegramAccount } from '../entities/telegram-account.entity'
import { ChatType, MessageEntityType } from '../telegram.constants'

export class Update {
  update_id: number
  type: string
}

export class MessageUpdate extends Update {
  message: Message
  type = 'message'
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
  entities: MessageEntity[]
  text?: string
  from?: TelegramAccount
  new_chat_members?: TelegramAccount[]
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

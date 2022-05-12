import { TelegramAccount } from '../entities/telegram-account.entity'
import { MessageEntityType } from '../telegram.contants'

export class Update {
  update_id: number
  type: string
}

export class MessageUpdate extends Update {
  message: Message
  tyoe = 'message'
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

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  SUPERGROUP = 'supergroup',
  CHANNEL = 'channel',
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

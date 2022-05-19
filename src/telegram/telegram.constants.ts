import { BotCommand } from './dtos'

export enum Command {
  START = '/start',
  MY_COURSES = '/my_courses',
  LOGOUT = '/logout',
}

export enum Callback {
  CHAPTERS = 'chapters',
  COURSE_FILES = 'course_files',
}
export const DEFAULT_COMMANDS: BotCommand[] = [
  {
    command: Command.START,
    description: 'Start the bot',
  },
]
export const AUTHORIZED_COMMANDS: BotCommand[] = [
  {
    command: Command.MY_COURSES,
    description: 'Display your courses',
  },
  {
    command: Command.LOGOUT,
    description: 'Unauthorize the bot',
  },
]
export enum MessageEntityType {
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  CASHTAG = 'cashtag',
  COMMAND = 'bot_command',
  URL = 'url',
  EMAIL = 'email',
}

export enum ChatType {
  PRIVATE = 'private',
  GROUP = 'group',
  SUPERGROUP = 'supergroup',
  CHANNEL = 'channel',
}

export enum FormattingOption {
  MARKDOWN = 'MarkdownV2',
  HTML = 'HTML',
}

export enum BotCommandScopeType {
  DEFAULT = 'default',
  ALL_PRIVATE_CHATS = 'all_private_chats',
  ALL_GROUP_CHATS = 'all_group_chats',
  ALL_CHAT_ADMINISTRATORS = 'all_chat_administrators',
  CHAT = 'chat',
  CHAT_ADMINISTRATOR = 'chat_administrator',
  CHAT_MEMBER = 'chat_member',
}

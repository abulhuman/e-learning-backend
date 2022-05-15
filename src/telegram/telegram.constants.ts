import { BotCommand } from './dtos'

export enum Command {
  START = '/start',
  MY_COURSES = '/my_courses',
}
export const BOT_COMMANDS: BotCommand[] = [
  {
    command: Command.START,
    description: 'Start the bot',
  },
  {
    command: Command.MY_COURSES,
    description: 'Display your courses',
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

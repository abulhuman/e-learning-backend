export enum Command {
  START = '/start',
  REGISTER = '/register',
  LIST = '/list',
  UNREGISTER = '/deregister',
}
export enum MessageEntityType {
  MENTION = 'mention',
  HASHTAG = 'hashtag',
  CASHTAG = 'cashtag',
  COMMAND = 'bot_command',
  URL = 'url',
  EMAIL = 'email',
}

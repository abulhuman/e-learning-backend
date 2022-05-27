import { FormattingOption } from '../telegram.constants'
import { BotCommand, BotCommandScope, MenuButton } from './types.dto'

export interface GetUpdatesParams {
  offset?: number
  limit?: number
  timeout?: number
  allowed_updates?: string[]
}
export interface InlineKeybardButton {
  text: string
  url?: string
  callback_data?: string
}
export interface LoginUrl {
  url: string
}
export interface InlineKeybardMarkup {
  inline_keyboard?: InlineKeybardButton[][]
  login_url?: LoginUrl
}

export interface SendMessageParams {
  chat_id: string
  text: string
  reply_to_message_id?: string
  reply_markup?: InlineKeybardMarkup
  parse_mode?: FormattingOption
}

export interface GetChatMemberParams {
  user_id: string
  chat_id: string
}

export interface AnswerCallbackParams {
  callback_query_id: string
  text?: string
  show_alert?: boolean
  url?: string
}

export interface SetMenuButtonParams {
  chat_id: string
  menu_button?: MenuButton
}

export interface SetMyCommandsParams {
  commands: BotCommand[]
  scope: BotCommandScope
}

export interface SendDocumentParams {
  chat_id: string
  document: string
  caption?: string
}

export interface EditMessageParams {
  chat_id: string
  message_id: string
  text: string
  parse_mode?: FormattingOption
  reply_markup?: InlineKeybardMarkup
}

export interface GetFileParams {
  file_path: string
}

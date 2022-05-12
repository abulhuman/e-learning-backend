export interface GetUpdatesParams {
  offset?: number
  limit?: number
  timeout?: number
  allowed_updates?: string[]
}

export interface InlineKeybardButton {
  text: string
  url?: string
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
}

export interface GetChatMemberParams {
  user_id: string
  chat_id: string
}

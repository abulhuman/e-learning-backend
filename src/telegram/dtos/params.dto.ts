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
export interface InlineKeybardMarkup {
  inline_keyboard: InlineKeybardButton[][]
}

export interface SendMessageParams {
  chat_id: string
  text: string
  reply_to_message_id?: string
  reply_markup?: InlineKeybardMarkup
}

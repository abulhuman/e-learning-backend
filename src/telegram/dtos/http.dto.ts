export interface Response {
  ok: boolean
  result?: any
  description?: string
  error_code?: number
  parameters?: ResponseParameters
}

interface ResponseParameters {
  migrate_to_chat_id?: number
  retry_after?: number
}

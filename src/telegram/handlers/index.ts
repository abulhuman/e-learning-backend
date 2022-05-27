import { callbackHandlers } from './callback'
import { commandHandlers } from './command'
import { FileSubmissionHandler } from './file-submission.handler'

export const handlers = [
  ...commandHandlers,
  ...callbackHandlers,
  FileSubmissionHandler,
]

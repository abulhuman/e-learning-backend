import { CancelSubmissionCallbackHandler } from './cancel-submission.callback.handler'
import { ChaptersCallbackHandler } from './chapters.callback.handler'
import { CourseFilesCallbackHandler } from './course-files.callback.handler'
import { InstructionsCallbackHandler } from './instructions.callback.handler'
import { SubmitCallbackHandler } from './submit.callback.handler'

export const callbackHandlers = [
  ChaptersCallbackHandler,
  CourseFilesCallbackHandler,
  SubmitCallbackHandler,
  CancelSubmissionCallbackHandler,
  InstructionsCallbackHandler,
]

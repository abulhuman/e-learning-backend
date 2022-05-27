import { Injectable } from '@nestjs/common'
import { CallbackQueryUpdate } from '../dtos'
import { CancelSubmissionCallbackHandler } from '../handlers/callback/cancel-submission.callback.handler'
import { ChaptersCallbackHandler } from '../handlers/callback/chapters.callback.handler'
import { CourseFilesCallbackHandler } from '../handlers/callback/course-files.callback.handler'
import { SubmitCallbackHandler } from '../handlers/callback/submit.callback.handler'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { Callback } from '../telegram.constants'

@Injectable()
export class CallbackDispatcher implements Dispatcher {
  constructor(
    private chaptersHandler: ChaptersCallbackHandler,
    private courseFilesHnadler: CourseFilesCallbackHandler,
    private submitHandler: SubmitCallbackHandler,
    private cancelSubmissionHandler: CancelSubmissionCallbackHandler,
  ) {}
  dispatch(update: CallbackQueryUpdate) {
    const { callback_query } = update
    const [callback, payload] = callback_query.data.split(' ')
    switch (callback) {
      case Callback.CHAPTERS:
        this.chaptersHandler.handle(payload, callback_query)
        break
      case Callback.COURSE_FILES:
        this.courseFilesHnadler.handle(payload, callback_query)
        break
      case Callback.SUBMIT:
        this.submitHandler.handle(callback_query.message, payload)
        break
      case Callback.CANCEL_SUBMISSION:
        this.cancelSubmissionHandler.handle(callback_query.message)
        break
    }
  }
}

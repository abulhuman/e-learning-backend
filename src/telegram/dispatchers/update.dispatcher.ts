import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { from, map } from 'rxjs'
import { MessageUpdate, Update } from '../dtos'
import { Dispatcher } from '../interfaces/dispatcher.interface'
import { MessageDispatcher } from './message.dispatcher'

@Injectable()
export class UpdateDispatcher implements Dispatcher {
  constructor(
    @Inject(forwardRef(() => MessageDispatcher))
    private messageDispatcher: MessageDispatcher,
  ) {}
  dispatch(updates: Update[]): void {
    from(updates)
      .pipe(
        map(update => {
          if (update.hasOwnProperty('message')) {
            update.type = 'message'
          }
          return update
        }),
      )
      .subscribe({
        next: update => {
          switch (update.type) {
            case 'message':
              this.messageDispatcher.dispatch(update as MessageUpdate)
              break
          }
        },
      })
  }
}

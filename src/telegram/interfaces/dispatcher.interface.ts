import { Update } from '../dtos'

export interface Dispatcher {
  dispatch(jobs: Update[] | Update)
}

import { callbackHandlers } from './callback'
import { commandHandlers } from './command'

export const handlers = [...commandHandlers, ...callbackHandlers]

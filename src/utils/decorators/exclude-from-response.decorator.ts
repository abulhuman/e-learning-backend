import { applyDecorators } from '@nestjs/common'
import { Exclude } from 'class-transformer'

export function ExcludeFromResponse() {
  return applyDecorators(Exclude({ toPlainOnly: true }))
}

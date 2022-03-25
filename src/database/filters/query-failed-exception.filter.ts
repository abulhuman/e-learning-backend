import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { PostgresErrorCode } from 'src/database/postgres-error-codes.enum'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception?.code === PostgresErrorCode.UniqueViolation) {
      const { detail } = exception?.driverError
      let message
      if (detail !== undefined) {
        /* 
          Remove 'Key' parenthesis and '=' from error message
          Original: 'Key (column_name)=(column_value) already exists'
          Final: 'column_name column_value already exists'
        */
        message = (detail as string)
          .replace(/[\(\)]/g, '')
          .substring(4)
          .replace(/=/, ' ')
      } else {
        // fall back error message
        message = 'Unique key violation'
      }
      super.catch(new BadRequestException(message), host)
    } else {
      super.catch(exception, host)
    }
  }
}

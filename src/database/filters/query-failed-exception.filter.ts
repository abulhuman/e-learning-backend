import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common'
import { GqlExceptionFilter } from '@nestjs/graphql'
import { PostgresErrorCode } from 'src/database/postgres-error-codes.enum'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements GqlExceptionFilter {
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
      return new BadRequestException(message)
    }
    return exception
  }
}

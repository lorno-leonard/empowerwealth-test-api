import { DefinedError } from 'ajv'

import { errorResponse, StatusCode } from '@libs/apiGateway'

export const returnAjvError = (errors: any): void => {
  for (const err of errors as DefinedError[]) {
    throw errorResponse(
      err?.message ?? 'Missing required properties',
      StatusCode.BAD_REQUEST
    )
  }
}

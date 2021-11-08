import 'source-map-support/register'
import Ajv, { JSONSchemaType } from 'ajv'
import type { FromSchema } from 'json-schema-to-ts'

import { returnAjvError } from '@libs/ajv'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { success, error, errorResponse, StatusCode } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import { isTokenVerified } from '@libs/jwt'
import schema from '../../schemas/verify-token'

type Body = FromSchema<typeof schema>
const bodySchema: JSONSchemaType<Body> = schema

const ajv = new Ajv()
const validate = ajv.compile(bodySchema)

export const verifyToken: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    try {
      // Validate fields
      if (!validate(event.body)) {
        returnAjvError(validate.errors)
      }

      // Expand passed data
      const { token } = event.body

      // Check if token is verified
      if (!isTokenVerified(token)) {
        throw errorResponse('Token invalid or expired', StatusCode.UNAUTHORIZED)
      }

      return success({
        message: 'Token verified',
      })
    } catch (exception: any) {
      return error(exception)
    }
  }

export const handler = middyfy(verifyToken)

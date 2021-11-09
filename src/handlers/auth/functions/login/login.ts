import 'source-map-support/register'
import Ajv, { JSONSchemaType } from 'ajv'
import type { FromSchema } from 'json-schema-to-ts'
import { pick } from 'ramda'

import { returnAjvError } from '@libs/ajv'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { success, error, errorResponse, StatusCode } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import { generateToken } from '@libs/jwt'
import User from '@models/User'
import mongoClient from '@services/mongo/client'
import schema from '../../schemas/login'

type Body = FromSchema<typeof schema>
const bodySchema: JSONSchemaType<Body> = schema

const ajv = new Ajv()
const validate = ajv.compile(bodySchema)

export const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    // Connect to database
    await mongoClient.connect()

    // Validate fields
    if (!validate(event.body)) {
      returnAjvError(validate.errors)
    }

    // Expand passed data
    const { email, password } = event.body

    // Check if user is existing
    const checkUser = await User.findOne({ email })
    if (!checkUser || (checkUser && !checkUser.validPassword(password))) {
      throw errorResponse('Invalid email or password', StatusCode.BAD_REQUEST)
    }

    const token = generateToken(pick(['email', 'type'], checkUser))
    return success({
      message: 'Successfully logged in',
      token,
    })
  } catch (exception: any) {
    return error(exception)
  } finally {
    // Disconnect to database
    await mongoClient.disconnect()
  }
}

export const handler = middyfy(login)

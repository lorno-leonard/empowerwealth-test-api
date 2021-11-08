import 'source-map-support/register'
import type { FromSchema } from 'json-schema-to-ts'
import Ajv, { JSONSchemaType } from 'ajv'

import { returnAjvError } from '@libs/ajv'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway'
import { success, error, errorResponse, StatusCode } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import User from '@models/User'
import mongoClient from '@services/mongo/client'
import schema from '../../schemas/register'

type Body = FromSchema<typeof schema>
const bodySchema: JSONSchemaType<Body> = schema

const ajv = new Ajv()
const validate = ajv.compile(bodySchema)

export const register: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    try {
      // Connect to database
      await mongoClient.connect()

      // Validate fields
      if (!validate(event.body)) {
        returnAjvError(validate.errors)
      }

      // Expand passed data
      const { name, email, password } = event.body

      // Check if user is existing
      const checkUser = await User.findOne({ email })
      if (checkUser) {
        throw errorResponse('Email is already taken', StatusCode.BAD_REQUEST)
      }

      // Create user
      const user = await new User()
      user.name = name
      user.email = email
      user.password = password
      await user.save()

      return success({
        message: 'Successfully registered',
      })
    } catch (exception: any) {
      return error(exception)
    }
  }

export const handler = middyfy(register)

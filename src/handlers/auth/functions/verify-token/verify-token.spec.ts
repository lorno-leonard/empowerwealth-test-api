import type { Context, Callback } from 'aws-lambda'
import faker from 'faker'
import { pick } from 'ramda'

import { StatusCode } from '@libs/apiGateway'
import type { ValidatedAPIGatewayProxyEvent } from '@libs/apiGateway'
import { generateToken } from '@libs/jwt'
import delay from '@libs/delay'
import User from '@models/User'
import mongoClient from '@services/mongo/client'
import schema from '../../schemas/verify-token'
import loginSchema from '../../schemas/login'
import { verifyToken } from './verify-token'
import { login } from './../login/login'

const context = {} as Context
const callback: Callback = (): void => {}
const data = {
  email: faker.internet.exampleEmail(),
  password: faker.internet.password(),
  name: faker.name.findName(),
}

afterAll(async () => {
  await mongoClient.disconnect()
})

describe('POST /auth/verify-token', () => {
  let token: string = ''

  beforeAll(async () => {
    await mongoClient.connect()

    // Create user
    const user = await new User()
    user.email = data.email
    user.name = data.name
    user.password = data.password
    await user.save()

    await mongoClient.disconnect()
  })

  it('it should fail if body parameters are missing', async () => {
    const event = { body: {} } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await verifyToken(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.BAD_REQUEST)
      expect(
        body?.error?.message.includes('must have required property')
      ).toBeTruthy()
    }
  })

  it('it should succeed to login', async () => {
    const event = {
      body: pick(['email', 'password'], data),
    } as ValidatedAPIGatewayProxyEvent<typeof loginSchema>

    const response = await login(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.OK)
      expect(body?.message).toBe('Successfully logged in')
      expect(body?.data?.email).toBe(data.email)
      expect(body?.data?.token).not.toBeUndefined()
      expect(body?.data?.token).not.toBeNull()
      token = body?.data?.token
    }
  })

  it('it should fail if non-existing token is used', async () => {
    const event = {
      body: {
        token: faker.random.alphaNumeric(),
      },
    } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await verifyToken(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.UNAUTHORIZED)
      expect(body?.error?.message).toBe('Token invalid or expired')
    }
  })

  it('it should succeed if existing token is used', async () => {
    const event = {
      body: {
        token,
      },
    } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await verifyToken(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.OK)
      expect(body?.message).toBe('Token verified')
    }
  })

  it('it should fail if expired token is used', async () => {
    const toExpireToken = generateToken({}, '1s') // token expires after 1 second
    await delay(1100) // delay for 1.1 second
    const event = {
      body: {
        token: toExpireToken,
      },
    } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await verifyToken(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.UNAUTHORIZED)
      expect(body?.error?.message).toBe('Token invalid or expired')
    }
  })
})

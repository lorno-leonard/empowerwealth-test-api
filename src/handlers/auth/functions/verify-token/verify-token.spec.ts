import type { Context, Callback } from 'aws-lambda'
import faker from 'faker'
import { pick } from 'ramda'

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
const body = {
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
    user.email = body.email
    user.name = body.name
    user.password = body.password
    await user.save()

    await mongoClient.disconnect()
  })

  it('it should fail if body parameters are missing', async () => {
    const event = { body: {} } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await verifyToken(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(400)
      expect(
        body?.error?.message.includes('must have required property')
      ).toBeTruthy()
    }
  })

  it('it should succeed to login', async () => {
    const event = {
      body: pick(['email', 'password'], body),
    } as ValidatedAPIGatewayProxyEvent<typeof loginSchema>

    const response = await login(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(200)
      expect(body?.message).toBe('Successfully logged in')
      expect(body?.token).not.toBeUndefined()
      expect(body?.token).not.toBeNull()
      token = body?.token
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
      expect(statusCode).toBe(401)
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
      expect(statusCode).toBe(200)
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
      expect(statusCode).toBe(401)
      expect(body?.error?.message).toBe('Token invalid or expired')
    }
  })
})

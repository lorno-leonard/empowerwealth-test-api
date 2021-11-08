import type { Context, Callback } from 'aws-lambda'
import faker from 'faker'

import type { ValidatedAPIGatewayProxyEvent } from '@libs/apiGateway'
import mongoClient from '@services/mongo/client'
import schema from '../../schemas/register'
import { register } from './register'

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

describe('POST /auth/register', () => {
  it('it should fail if body parameters are missing', async () => {
    const event = { body: {} } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await register(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(400)
      expect(
        body?.error?.message.includes('must have required property')
      ).toBeTruthy()
    }
  })

  it('it should succeed if body parameters are existing', async () => {
    const event = { body } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await register(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(200)
      expect(body?.message).toBe('Successfully registered')
    }
  })

  it('it should fail if same credentials are passed', async () => {
    const event = { body } as ValidatedAPIGatewayProxyEvent<typeof schema>

    const response = await register(event, context, callback)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(400)
      expect(body?.error?.message).toBe('Email is already taken')
    }
  })
})

import type { APIGatewayProxyEvent } from 'aws-lambda'

import mongoClient from '@services/mongo/client'
import { getProperties } from './get-properties'

afterAll(async () => {
  await mongoClient.disconnect()
})

describe('GET /property', () => {
  it('it should get a list of properties', async () => {
    const event = {} as APIGatewayProxyEvent

    const response = await getProperties(event)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(200)
      expect(body?.message).toBe('Successfully retrieved properties')
    }
  })
})

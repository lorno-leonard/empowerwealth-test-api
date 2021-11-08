import type { APIGatewayProxyResult } from 'aws-lambda'

import { root } from './root'

describe('GET /', () => {
  it('it should display a welcome message', async () => {
    const response: APIGatewayProxyResult = await root()
    const { body: jsonBody, statusCode } = response
    const body = JSON.parse(jsonBody)

    expect(statusCode).toBe(200)
    expect(body?.message).toBe('Empower Wealth Test API service')
  })
})

import type { APIGatewayProxyEvent } from 'aws-lambda'
import faker from 'faker'

import PropertyData from '@models/PropertyData'
import mongoClient from '@services/mongo/client'
import { getProperties } from './get-properties'

afterAll(async () => {
  await mongoClient.disconnect()
})

describe('GET /property', () => {
  beforeAll(async () => {
    await mongoClient.connect()

    // Create properties
    let i = 0
    while (i < 10) {
      const property = await new PropertyData()
      property.propertyId = faker.datatype.number({ min: 100000, max: 999999 })
      property.propertyName = faker.address.streetAddress()
      property.income = {
        January: faker.datatype.number(),
        February: faker.datatype.number(),
        March: faker.datatype.number(),
        April: faker.datatype.number(),
        May: faker.datatype.number(),
        June: faker.datatype.number(),
        July: faker.datatype.number(),
        August: faker.datatype.number(),
        September: faker.datatype.number(),
        October: faker.datatype.number(),
        November: faker.datatype.number(),
        December: faker.datatype.number(),
      }
      property.expense = {
        January: faker.datatype.number(),
        February: faker.datatype.number(),
        March: faker.datatype.number(),
        April: faker.datatype.number(),
        May: faker.datatype.number(),
        June: faker.datatype.number(),
        July: faker.datatype.number(),
        August: faker.datatype.number(),
        September: faker.datatype.number(),
        October: faker.datatype.number(),
        November: faker.datatype.number(),
        December: faker.datatype.number(),
      }
      await property.save()

      i++
    }

    await mongoClient.disconnect()
  })

  it('it should get a list of properties', async () => {
    const event = {} as APIGatewayProxyEvent

    const response = await getProperties(event)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      console.log(body)
      expect(statusCode).toBe(200)
      expect(body?.message).toBe('Successfully retrieved properties')
    }
  })
})

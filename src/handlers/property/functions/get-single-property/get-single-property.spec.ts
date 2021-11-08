import type { APIGatewayProxyEvent } from 'aws-lambda'
import faker from 'faker'

import { StatusCode } from '@libs/apiGateway'
import PropertyData, { IPropertyData } from '@models/PropertyData'
import mongoClient from '@services/mongo/client'
import { getSingleProperty } from './get-single-property'

const data = {
  propertyId: faker.datatype.number({ min: 100000, max: 999999 }),
  propertyName: faker.address.streetAddress(),
  income: {
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
  },
  expense: {
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
  },
}

afterAll(async () => {
  await mongoClient.disconnect()
})

describe('GET /property/{id}', () => {
  beforeAll(async () => {
    await mongoClient.connect()

    // Create property
    const property = await new PropertyData()
    property.propertyId = data.propertyId
    property.propertyName = data.propertyName
    property.income = data.income
    property.expense = data.expense
    await property.save()

    await mongoClient.disconnect()
  })

  it('it should fail when using a non-existing id', async () => {
    const event = {
      pathParameters: {
        id: faker.datatype.number({ min: 100000, max: 999999 }),
      },
    } as unknown as APIGatewayProxyEvent

    const response = await getSingleProperty(event)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.NOT_FOUND)
      expect(body?.error?.message).toBe('Property is not existing')
    }
  })

  it('it should succeed when using an existing id', async () => {
    const event = {
      pathParameters: {
        id: data.propertyId,
      },
    } as unknown as APIGatewayProxyEvent

    const response = await getSingleProperty(event)
    if (response) {
      const { body: jsonBody, statusCode } = response
      const body = JSON.parse(jsonBody)
      expect(statusCode).toBe(StatusCode.OK)
      expect(body?.message).toBe('Successfully retrieved property')

      const property: IPropertyData = body?.property
      expect(property).toHaveProperty('propertyId')
      expect(property).toHaveProperty('propertyName')
      expect(property).toHaveProperty('income')
      expect(property).toHaveProperty('expense')
      expect(property.propertyId).toBe(data.propertyId)
      expect(property.propertyName).toBe(data.propertyName)
      expect(property.income).toStrictEqual(data.income)
      expect(property.expense).toStrictEqual(data.expense)
    }
  })
})

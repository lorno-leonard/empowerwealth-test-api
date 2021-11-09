import 'source-map-support/register'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { success, error, errorResponse, StatusCode } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import PropertyData from '@models/PropertyData'
import mongoClient from '@services/mongo/client'

export const getSingleProperty = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Connect to database
    await mongoClient.connect()

    const id: number = parseInt(event.pathParameters?.id || '0', 10)

    // Get single property
    const property = await PropertyData.findOne({ propertyId: id }).select({
      'income._id': 0,
      'expense._id': 0,
    })

    // Check property
    if (!property) {
      throw errorResponse('Property is not existing', StatusCode.NOT_FOUND)
    }

    return success({
      message: 'Successfully retrieved property',
      property,
    })
  } catch (exception: any) {
    return error(exception)
  } finally {
    // Disconnect to database
    await mongoClient.disconnect()
  }
}

export const handler = middyfy(getSingleProperty)

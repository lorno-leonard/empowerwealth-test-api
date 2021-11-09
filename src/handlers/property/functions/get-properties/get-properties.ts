import 'source-map-support/register'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import config from '@config/mongo'
import { success, error } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import PropertyData from '@models/PropertyData'
import mongoClient from '@services/mongo/client'

export const getProperties = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Connect to database
    await mongoClient.connect()
    console.log({ config })
    // Get properties
    const properties = await PropertyData.find().select({
      propertyId: 1,
      propertyName: 1,
    })
    console.log({ properties })
    return success({
      message: 'Successfully retrieved properties',
      properties,
    })
  } catch (exception: any) {
    console.log({ exception })
    return error(exception)
  }
}

export const handler = middyfy(getProperties)

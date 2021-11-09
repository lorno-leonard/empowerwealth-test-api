import 'source-map-support/register'
import type { APIGatewayTokenAuthorizerEvent } from 'aws-lambda'
import trim from 'lodash/trim'

import { AuthResponse, AuthUser } from '@libs/apiGateway'
import { middyfy } from '@libs/lambda'
import { isTokenVerified, verifyToken } from '@libs/jwt'
import mongoClient from '@services/mongo/client'

export const authorize = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<AuthResponse> => {
  try {
    // Connect to database
    await mongoClient.connect()

    const context = await authenticate(event.authorizationToken)
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: getWildcardArn(event.methodArn),
          },
        ],
      },
      context,
    }
  } catch (exception: any) {
    return Promise.reject(`Unauthorized: ${exception.message || exception}`)
  } finally {
    // Disconnect to database
    await mongoClient.disconnect()
  }
}

/**
 * Authenticate
 */
async function authenticate(token: string): Promise<AuthUser> {
  if (isTokenVerified(token)) {
    const payload = verifyToken(token)
    return payload as AuthUser
  }

  throw new Error('Passed authentication is not supported')
}

/**
 * Get wildcard ARN
 */
function getWildcardArn(methodArn: string): string {
  const lastColon = methodArn.lastIndexOf(':')
  const [api, env] = methodArn.substring(lastColon + 1).split('/')
  const prefix = trim(process.env.API_PREFIX || '/api/v1', '/')
  return `${methodArn.substring(0, lastColon + 1)}${api}/${env}/*/${prefix}/*`
}

export const handler = middyfy(authorize)

import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda'
import type { FromSchema } from 'json-schema-to-ts'
import isString from 'lodash/isString'

import { ErrorResponse, Headers, Body } from './types'

export type ValidatedAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  'body'
> & {
  body: FromSchema<S>
}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  }
}

export enum StatusCode {
  OK = 200,
  MOVED_PERMANENTLY = 301,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export const DEFAULT_HEADERS: Headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
}

export const response = (
  body: Body,
  statusCode: StatusCode = StatusCode.OK,
  headers: Headers = DEFAULT_HEADERS
): APIGatewayProxyResult => {
  return {
    body: JSON.stringify(body),
    headers,
    statusCode,
  }
}

export const success = (
  body: Body,
  headers?: Headers
): APIGatewayProxyResult => {
  return response(body, StatusCode.OK, headers)
}

export const error = (
  err: string | Error | ErrorResponse,
  statusCode: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
  headers?: Headers
): APIGatewayProxyResult => {
  if (isString(err)) {
    err = {
      message: err,
    }
  } else if (err instanceof Error) {
    err = {
      message: err.message || String(err),
    }
  }
  return response({ error: err }, err?.status || statusCode, headers)
}

export const errorResponse = (
  message: string,
  status: StatusCode = StatusCode.INTERNAL_SERVER_ERROR,
  extra: Omit<ErrorResponse, 'message' | 'status'> = {}
): ErrorResponse => {
  return {
    message,
    status,
    ...extra,
  }
}

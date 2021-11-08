export type KeyValuePair<T> = {
  [key: string]: T
}

export type Any = number | string | null | KeyValuePair<any>
export type Body = Any | Any[]

export type Headers = {
  [name: string]: string
}

export type ErrorResponse = {
  code?: string
  data?: Any
  message: string
  status?: number
}

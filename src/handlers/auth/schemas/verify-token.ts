export default {
  type: 'object',
  properties: {
    token: { type: 'string' },
  },
  required: ['token'],
  additionalProperties: false,
} as const

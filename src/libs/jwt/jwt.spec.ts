import { JwtPayload } from 'jsonwebtoken'

import { generateToken, isTokenVerified, verifyToken } from './jwt'

describe('generate and validate token', () => {
  const data = { email: 'foo@bar' }
  let token = ''

  test('it should generate token', () => {
    token = generateToken(data)
    expect(generateToken).not.toBeUndefined()
    expect(generateToken).not.toBeNull()
  })

  test('it should verify generated token', () => {
    const isVerified = isTokenVerified(token)
    expect(isVerified).toBeTruthy()

    const context = verifyToken(token)
    expect(context).toHaveProperty('email')
    expect({ ...(context as JwtPayload) }.email).toBe(data.email)
  })

  test('it should not verify fake token', () => {
    const isVerified = isTokenVerified('abc')
    expect(isVerified).toBeFalsy()
  })
})

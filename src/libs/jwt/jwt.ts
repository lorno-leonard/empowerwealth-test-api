import { sign, verify, JwtPayload } from 'jsonwebtoken'

export const generateToken = (
  data: any = {},
  expiresIn: string = '7d'
): string => {
  return sign(data, process.env.JWT_SECRET ?? 'secret', { expiresIn })
}

export const isTokenVerified = (token: string): boolean => {
  try {
    verify(token, process.env.JWT_SECRET ?? 'secret')
    return true
  } catch (err) {
    return false
  }
}

export const verifyToken = (token: string): JwtPayload | string => {
  return verify(token, process.env.JWT_SECRET ?? 'secret')
}

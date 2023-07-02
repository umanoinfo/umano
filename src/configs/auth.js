import { hash, compare } from 'bcryptjs'

export async function hashPassword(password) {
  const hashedPassword = await hash(password, 12)

  return hashedPassword
}

export async function verifyPassword(passwrod, hashedPassword) {
  const isValid = await compare(passwrod, hashedPassword)
  
  return isValid
}

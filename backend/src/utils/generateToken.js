import jwt from 'jsonwebtoken';

/**
 * Signs a JWT for the given user id.
 * Expiry is 30 days — adjust via JWT_EXPIRES_IN env var if needed.
 */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to your .env file.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export default generateToken;

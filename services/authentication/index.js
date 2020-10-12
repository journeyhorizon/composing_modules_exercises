import { NO_TOKEN_FOUND, INVALID_TOKEN } from '../error_type';
import { handleAsyncWrapper } from '../request_handle_wrapper';
import config from '../config';
import jwt from 'jsonwebtoken';
import { integrationSdk } from '../sharetribe_admin';

export const loginMiddleware = handleAsyncWrapper(async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    if (!token)
      return res.status(401).send({
        code: 401,
        message: "Not authorized",
        stringCode: NO_TOKEN_FOUND
      });
    const signedData = jwt.verify(token, config.iam.secret);
    res.locals.currentUserId = signedData.id;
    next();
  } catch (err) {
    console.log('Authenticating error', err);
    return res.status(400).send({
      code: 400,
      message: "Invalid token",
      stringCode: INVALID_TOKEN
    });
  }
}, { retries: config.retries })

const generateToken = id =>
  jwt.sign({ id }, config.iam.secret, {
    expiresIn: '365 days'
  });

const passTokenToUser = ({ id, token }) => {
  return integrationSdk.users.updateProfile({
    id,
    privateData: {
      accessToken: token
    }
  });
}

export const handleTokenCreation = (id) => {
  const token = generateToken(id);
  return passTokenToUser({ id, token });
}
import { NO_TOKEN_FOUND, INVALID_TOKEN } from '../error_type';
import { handleAsyncWrapper } from '../request_handle_wrapper';
import config from '../config';
import jwt from 'jsonwebtoken';
import { getUserData, integrationSdk } from '../sharetribe_admin';
import { denormalisedResponseEntities, sdk } from '../sharetribe';
import { createFlexErrorObject } from '../on_behalf_of/error';
import { UNAUTHORISED } from './error';
import { generatePassword } from '../on_behalf_of/utils';

const loginMiddleware = handleAsyncWrapper(async (req, res, next) => {
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

export const generateToken = data =>
  jwt.sign(data, config.sharetribeFlex.page.secret, {
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

const handleTokenCreation = (id) => {
  const token = generateToken(id);
  return passTokenToUser({ id, token });
}

const authenticateTeamMember = async ({
  clientTokenStore
}) => {
  try {
    const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
    const currentUserRes = await trustedSdk.currentUser.show();
    const currentUser = denormalisedResponseEntities(currentUserRes)[0];
    const { metadata } = currentUser.attributes.profile;
    const {
      pageAccountId
    } = metadata;

    if (!pageAccountId) {
      return {
        code: 404,
        data: createFlexErrorObject({
          status: 404,
          message: UNAUTHORISED,
          messageCode: UNAUTHORISED
        })
      }
    }

    const pageAccount = await getUserData({ userId: pageAccountId });
    const email = pageAccount.attributes.email;

    const authenRes = await sdk.login({
      username: email,
      password: generatePassword(pageAccount.id.uuid)
    });

    return {
      code: 200,
      data: authenRes
    };
  } catch (e) {
    console.error(e);
    return {
      code: e.status || e.code
        ? e.status || e.code
        : 500,
      data: e.data ? e.data : e.toString()
    };
  }
}

export default authenticateTeamMember;
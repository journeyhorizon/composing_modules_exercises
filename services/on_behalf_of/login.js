import config from '../config';
import { INVALID_TOKEN, WRONG_PARAMS, INVALID_EMAIL_ERROR } from '../error_type';
import { denormalisedResponseEntities, sdk } from '../sharetribe/index';
import { getUserData, integrationSdk } from '../sharetribe_admin';
import { ALREADY_IN_PAGE_ERROR, createFlexErrorObject } from './error';
import jwt from 'jsonwebtoken';

const login = async ({
  data,
}) => {
  const {
    teamMemberAuthParams: rawTeamMemberAuthParams,
    ...params
  } = data;

  if (!rawTeamMemberAuthParams) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: WRONG_PARAMS,
        messageCode: WRONG_PARAMS
      })
    };
  }

  const teamMemberAuthParams = JSON.parse(rawTeamMemberAuthParams);

  const loginResult = await sdk.login(params);
  const currentUserRes = await sdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  if (currentUser.attributes.profile.metadata.pageAccountId) {
    return {
      code: 409,
      data: createFlexErrorObject({
        status: 409,
        message: ALREADY_IN_PAGE_ERROR,
        messageCode: ALREADY_IN_PAGE_ERROR
      })
    };
  }

  const {
    verificationToken
  } = teamMemberAuthParams;

  const {
    username: clientEmail,
  } = params;

  const decryptData = () => {
    try {
      return jwt.verify(verificationToken, config.sharetribeFlex.page.secret);
    } catch (e) {
      const { stack, ...errorObj } = e;
      throw ({
        code: 403,
        data: createFlexErrorObject({
          status: 403,
          message: errorObj.name,
          messageCode: errorObj.name,
        })
      });
    }
  }

  const signedData = decryptData();

  const {
    email: encryptedEmail,
    pageAccountId,
  } = signedData;

  if (encryptedEmail !== clientEmail) {
    return {
      code: 403,
      data: createFlexErrorObject({
        status: 403,
        message: INVALID_TOKEN,
        messageCode: INVALID_TOKEN
      })
    };
  }

  const currentPageAccount = await getUserData({ userId: pageAccountId });

  if (!Array.isArray(currentPageAccount
    .attributes.profile.metadata
    .pendingTeamMembers) ||
    !currentPageAccount
      .attributes.profile.metadata
      .pendingTeamMembers
      .find(email => email === encryptedEmail)) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: INVALID_EMAIL_ERROR,
        messageCode: INVALID_EMAIL_ERROR
      })
    };
  }

  const updateTeamMetadata = async () => {
    return Promise.all([
      integrationSdk.users.updateProfile({
        id: currentPageAccount.id,
        publicData: {
          teamMemberIds: [
            ...currentPageAccount.attributes.profile.publicData.teamMemberIds,
            currentUser.id.uuid
          ],
        },
        metadata: {
          pendingTeamMembers:
            Array.isArray(currentPageAccount
              .attributes.profile.metadata
              .pendingTeamMembers)
              ? currentPageAccount
                .attributes.profile.metadata
                .pendingTeamMembers
                .filter(email => email !== encryptedEmail)
              : []
        }
      }),
      integrationSdk.users.updateProfile({
        id: currentUser.id,
        metadata: {
          pageAccountId: currentPageAccount.id.uuid,
        }
      })
    ]);
  };

  await updateTeamMetadata();

  return loginResult;
}

export default login;
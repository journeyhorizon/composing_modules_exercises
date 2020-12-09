import config from '../../config';
import { INVALID_TOKEN, WRONG_PARAMS, INVALID_EMAIL_ERROR } from '../../error_type';
import { denormalisedResponseEntities, sdk } from '../../sharetribe/index';
import { getUserData, integrationSdk } from '../../sharetribe_admin';
import { createFlexErrorObject } from '../error';
import jwt from 'jsonwebtoken';

const create = async ({
  data,
}) => {
  const {
    teamMemberAuthParams,
    ...params
  } = data;
  if (!teamMemberAuthParams) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: WRONG_PARAMS,
        messageCode: WRONG_PARAMS
      })
    };
  }

  const {
    verificationToken
  } = teamMemberAuthParams;

  const {
    email: clientEmail,
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

  const creationRes = await sdk.currentUser.create(params);
  const createdUser = denormalisedResponseEntities(creationRes)[0];

  const updateTeamMetadata = async () => {
    return Promise.all([
      integrationSdk.users.updateProfile({
        id: currentPageAccount.id,
        publicData: {
          teamMemberIds: [
            ...currentPageAccount.attributes.profile.publicData.teamMemberIds,
            createdUser.id.uuid
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
        id: createdUser.id,
        metadata: {
          pageAccountId: currentPageAccount.id.uuid,
        }
      })
    ]);
  };

  await updateTeamMetadata();

  return creationRes;
}

export default create;
import config from '../config';
import { INVALID_TOKEN, WRONG_PARAMS } from '../error_type';
import { denormalisedResponseEntities, sdk } from '../sharetribe/index';
import { getListingData, getUserData, integrationSdk } from '../sharetribe_admin';
import { createFlexErrorObject } from './error';
import jwt from 'jsonwebtoken';
import { token } from 'morgan';

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

  const updatePageListingData = async () => {
    const listing = await getListingData({
      listingId: currentPageAccount.attributes
        .profile.publicData.idListingPage
    });

    const teamManagementObj =
      Array.isArray(listing
        .attributes.publicData
        .teamManagementObj)
        ? listing
          .attributes.publicData
          .teamManagementObj.filter(teamMemberData => {
            return teamMemberData.email !== encryptedEmail
          })
        : [];

    return integrationSdk.listings.update({
      id: listing.id,
      publicData: {
        teamManagementObj
      }
    });
  }

  await updateTeamMetadata();

  updatePageListingData();

  return loginResult;
}

export default login;
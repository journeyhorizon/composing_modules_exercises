import config from '../../config';
import { INVALID_TOKEN, WRONG_PARAMS } from '../../error_type';
import { denormalisedResponseEntities, sdk } from '../../sharetribe/index';
import { getListingData, getUserData, integrationSdk } from '../../sharetribe_admin';
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

  const signedData = jwt.verify(verificationToken, config.sharetribeFlex.page.secret);
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

  return creationRes;
}

export default create;
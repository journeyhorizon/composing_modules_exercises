import config from '../../config';
import { WRONG_PARAMS } from '../../error_type';
import { denormalisedResponseEntities, sdk, types as sdkTypes } from '../../sharetribe/index';
import { getUserData, integrationSdk } from '../../sharetribe_admin';
import { uuidv4 } from '../../utils';
import { createFlexErrorObject, PAGE_EXISTED_ERROR } from '../error';
import { PAGE_LISTING_TYPE } from '../types';
import { generatePassword } from '../utils';

const { UUID } = sdkTypes;

const handlePageAccountExisted = async ({
  pageAccountId,
  currentUser,
  data,
  queryParams
}) => {
  let loginWithUniquePasswordFailed = false;

  const pageAccount = await getUserData({ userId: pageAccountId });

  const email = pageAccount.attributes.email;

  await sdk.login({
    username: email,
    password: generatePassword(pageAccountId)
  }).catch(e => {
    loginWithUniquePasswordFailed = true;
  });

  if (loginWithUniquePasswordFailed) {
    await sdk.login({
      username: email,
      password: generatePassword(config.sharetribeFlex.page.secret)
    });

    await sdk.currentUser.changePassword({
      newPassword: generatePassword(pageAccountId),
      currentPassword: generatePassword(config.sharetribeFlex.page.secret)
    })
  }

  const listingCreationRes = await sdk.ownListings.createDraft(data, queryParams);

  const { metadata } = pageAccount.attributes.profile;
  const {
    pageListingId = []
  } = metadata;

  await integrationSdk.users.updateProfile({
    id: pageAccountId,
    metadata: {
      pageListingId: typeof pageListingId === 'string'
        ? [pageListingId, denormalisedResponseEntities(listingCreationRes)[0].id.uuid]
        : [
          ...pageListingId,
          denormalisedResponseEntities(listingCreationRes)[0].id.uuid
        ]
    }
  });

  return listingCreationRes;
}

const handlePageListingCreation = async ({
  currentUser,
  data,
  queryParams
}) => {
  const { metadata } = currentUser.attributes.profile;
  const {
    pageAccountId
  } = metadata;

  if (pageAccountId) {
    return handlePageAccountExisted({
      pageAccountId,
      currentUser,
      data,
      queryParams
    });
  }

  const defaultEmail = `${config
    .sharetribeFlex.page
    .defaultEmailPrefix}+${uuidv4()}${config
      .sharetribeFlex.page
      .defaultEmailSuffix}`;

  const pageUserRes = await sdk.currentUser
    .create({
      email: defaultEmail,
      firstName: data.title,
      lastName: "Page",
      password: generatePassword(config.sharetribeFlex.page.secret)
    });

  const pageUser = denormalisedResponseEntities(pageUserRes)[0];

  const handlePageData = async ({ defaultEmail }) => {
    await sdk.login({
      username: defaultEmail,
      password: generatePassword(config.sharetribeFlex.page.secret)
    });

    await sdk.currentUser.changePassword({
      newPassword: generatePassword(pageUser.id.uuid),
      currentPassword: generatePassword(config.sharetribeFlex.page.secret)
    })

    const listingCreationRes = await sdk.ownListings.createDraft(data, queryParams);
    return listingCreationRes;
  }

  const updateTeamMetadata = async () => {
    return Promise.all([
      integrationSdk.users.updateProfile({
        id: pageUser.id,
        publicData: {
          teamMemberIds: [currentUser.id.uuid]
        }
      }),
      integrationSdk.users.updateProfile({
        id: currentUser.id,
        metadata: {
          pageAccountId: pageUser.id.uuid
        }
      })
    ]);
  };

  const [listingCreationRes] = await Promise.all([
    handlePageData({
      defaultEmail
    }),
    updateTeamMetadata()
  ]);

  await integrationSdk.users.updateProfile({
    id: pageUser.id,
    metadata: {
      pageListingId: [denormalisedResponseEntities(listingCreationRes)[0].id.uuid]
    }
  })

  return listingCreationRes;
}

const cleanUpResAfterCall = async () => sdk
  .logout();

const createDraft = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const { publicData = {} } = data;
  const {
    listingType
  } = publicData;

  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  if (listingType !== PAGE_LISTING_TYPE || !data.title) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: WRONG_PARAMS,
        messageCode: WRONG_PARAMS
      })
    };
  }

  return handlePageListingCreation({
    currentUser,
    data,
    queryParams
  });
}

const finalisedCreateDraftCall = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  return createDraft({
    data,
    clientTokenStore,
    clientQueryParams
  }).then(async (res) => {
    await cleanUpResAfterCall();
    return res;
  });
}

export default finalisedCreateDraftCall;
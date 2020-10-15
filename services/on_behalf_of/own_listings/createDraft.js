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
  trustedSdk,
  currentUser,
  data,
  queryParams
}) => {
  const pageListingRes = await integrationSdk.listings.query({
    authorId: pageAccountId,
    pub_listingType: PAGE_EXISTED_ERROR
  });

  const pageListings = denormalisedResponseEntities(pageListingRes);

  if (pageListings.length > 0) {
    if (pageAccountId === currentUser.attributes.profile.metadata.pageAccountId) {
      pageListingRes.data.data = pageListingRes.data.data[0];
      return pageListingRes;
    }
    //TODO: Determine if we need to return 409 when team member try to create listing again or should we return the listing that the account already have
    return {
      code: 409,
      data: createFlexErrorObject({
        status: 409,
        message: PAGE_EXISTED_ERROR,
        messageCode: PAGE_EXISTED_ERROR
      })
    };
  }

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

  await integrationSdk.users.updateProfile({
    id: pageAccountId,
    metadata: {
      pageListingId: denormalisedResponseEntities(listingCreationRes)[0].id.uuid
    }
  })

  return listingCreationRes;
}

const handlePageListingCreation = async ({
  trustedSdk,
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
      trustedSdk,
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
      firstName: data.title, //TODO: Change here when connect with client
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
      pageListingId: denormalisedResponseEntities(listingCreationRes)[0].id.uuid
    }
  })

  return listingCreationRes;
}

const handleProductListingCreation = ({
  sdk,
  currentUser,
  data,
  queryParams
}) => {
  //TODO: implement this
  return;
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
    sdk: trustedSdk,
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
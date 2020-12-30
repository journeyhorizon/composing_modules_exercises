import config from '../../config';
import { denormalisedResponseEntities, sdk } from '../../sharetribe/index';
import { integrationSdk } from '../../sharetribe_admin';
import { createFlexErrorObject, PAGE_EXISTED_ERROR } from '../error';
import { uuidv4 } from '../../utils';
import { generatePassword } from '../utils';

export const handlePageData = async ({ defaultEmail, companyAccount }) => {
  await sdk.login({
    username: defaultEmail,
    password: generatePassword(config.sharetribeFlex.page.secret)
  });

  await sdk.currentUser.changePassword({
    newPassword: generatePassword(companyAccount.id.uuid),
    currentPassword: generatePassword(config.sharetribeFlex.page.secret)
  });
}

export const updateTeamMetadata = async ({ companyAccount, currentUser }) => {
  return Promise.all([
    integrationSdk.users.updateProfile({
      id: companyAccount.id,
      publicData: {
        teamMemberIds: [currentUser.id.uuid]
      }
    }),
    integrationSdk.users.updateProfile({
      id: currentUser.id,
      metadata: {
        pageAccountId: companyAccount.id.uuid
      }
    })
  ]);
};

const create = async ({
  data = {},
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const { metadata } = currentUser.attributes.profile;
  const {
    pageAccountId
  } = metadata;

  if (!!pageAccountId) {
    return {
      code: 409,
      data: createFlexErrorObject({
        status: 409,
        message: PAGE_EXISTED_ERROR,
        messageCode: PAGE_EXISTED_ERROR
      })
    }
  }

  const {
    protectedData
  } = data;

  const defaultEmail = `${config
    .sharetribeFlex.page
    .defaultEmailPrefix}+${uuidv4()}${config
      .sharetribeFlex.page
      .defaultEmailSuffix}`;

  const params = {
    email: defaultEmail,
    firstName: "Marketplace",
    lastName: "Company",
    password: generatePassword(config.sharetribeFlex.page.secret),
    displayName: "Marketplace Company"
  };

  if (protectedData) {
    params.protectedData = protectedData
  }

  const companyAccountRes = await sdk.currentUser
    .create(params);

  const companyAccount = denormalisedResponseEntities(companyAccountRes)[0];

  const [[companyUpdateRes]] = await Promise.all([
    updateTeamMetadata({
      companyAccount,
      currentUser
    }),
    handlePageData({
      defaultEmail,
      companyAccount
    }),
  ]);

  return companyUpdateRes;
}

export default create;
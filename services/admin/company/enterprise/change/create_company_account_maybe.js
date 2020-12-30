import config from "../../../../config";
import { handlePageData, updateTeamMetadata } from "../../../../on_behalf_of/company/create";
import { generatePassword } from "../../../../on_behalf_of/utils";
import { denormalisedResponseEntities, sdk } from "../../../../sharetribe";
import { uuidv4 } from "../../../../utils";
import { COMPANY_TYPE } from "./types"

export const createCompanyAccountMaybe = async ({
  id,
  type,
  data
}) => {
  if (type === COMPANY_TYPE) {
    return {
      id,
      data
    };
  }

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

  const companyAccountRes = await sdk.currentUser
    .create(params);

  const companyAccount = denormalisedResponseEntities(companyAccountRes)[0];

  await Promise.all([
    updateTeamMetadata({
      companyAccount,
      currentUser
    }),
    handlePageData({
      defaultEmail,
      companyAccount
    }),
  ]);

  return {
    id: companyAccount.id.uuid,
  };
}

export default createCompanyAccountMaybe;
import { denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject, IS_PAGE_EMAIL_ERROR } from "../error";

const request = async ({
  data,
}) => {
  const {
    email
  } = data;

  const listingsRes = await integrationSdk.listings.query({
    pub_email: email
  });
  const entities = denormalisedResponseEntities(listingsRes);
  const isPageEmail = entities.length > 0;

  if (isPageEmail) {
    return {
      code: 403,
      data: createFlexErrorObject({
        status: 403,
        message: IS_PAGE_EMAIL_ERROR,
        messageCode: IS_PAGE_EMAIL_ERROR
      })
    }
  }

  return sdk.passwordReset
    .request({ email });
}

export default request;
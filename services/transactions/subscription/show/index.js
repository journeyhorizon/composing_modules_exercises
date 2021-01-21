import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import { SUBSCRIPTION_NOT_FOUND_ERROR } from '../../../error';
import subscriptionSdk from "../../../subscription";
import { transformClientQueryParams } from "../../../utils";
import { createFlexErrorObject } from "../../../error";

const show = async ({
  clientTokenStore,
  clientQueryParams,
}) => {
  // const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  // const currentUserRes = await trustedSdk.currentUser.show();
  // const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const queryParams = transformClientQueryParams(clientQueryParams);

  const {
    include,
    id
  } = queryParams;


  if (!id) {
    return {
      code: 404,
      data: createFlexErrorObject({
        code: 404,
        message: SUBSCRIPTION_NOT_FOUND_ERROR,
        messageCode: SUBSCRIPTION_NOT_FOUND_ERROR
      })
    };
  }

  //TODO: Add additional logic to check if the currentUser has the permission to see this subscription details
  return subscriptionSdk.get({
    id,
    include
  });
}

export default show;
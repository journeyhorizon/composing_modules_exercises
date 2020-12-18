import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import { SUBSCRIPTION_NOT_FOUND_ERROR } from '../../../error_type';
import subscriptionSdk from "../../../subscription";
import { transformClientQueryParams } from "../../../utils";
import { createFlexErrorObject } from "../../../on_behalf_of/error";

const show = async ({
  clientTokenStore,
  clientQueryParams,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = currentUser;

  if (!subscription || !subscription.id) {
    return {
      code: 404,
      data: createFlexErrorObject({
        code: 404,
        message: SUBSCRIPTION_NOT_FOUND_ERROR,
        messageCode: SUBSCRIPTION_NOT_FOUND_ERROR
      })
    };
  }

  const queryParams = transformClientQueryParams(clientQueryParams);

  const {
    include
  } = queryParams;

  return subscriptionSdk.get({
    id: subscription.id,
    include
  });
}

export default show;
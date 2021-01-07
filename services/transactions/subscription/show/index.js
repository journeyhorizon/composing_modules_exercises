import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import { SUBSCRIPTION_NOT_FOUND_ERROR, WRONG_SUBSCRIPTION_PLAN } from '../../../error';
import subscriptionSdk from "../../../subscription";
import { transformClientQueryParams } from "../../../utils";
import { createFlexErrorObject } from "../../../error";
import { ENTERPRISE_PLAN } from "../../../subscription/types";

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

  const {
    type,
    pastSubscriptionIds
  } = subscription;

  let id = subscription.id;

  if (type === ENTERPRISE_PLAN) {
    if (!Array.isArray(pastSubscriptionIds) || pastSubscriptionIds < 1) {
      return {
        code: 400,
        data: createFlexErrorObject({
          code: 400,
          message: WRONG_SUBSCRIPTION_PLAN,
          messageCode: WRONG_SUBSCRIPTION_PLAN
        })
      };
    }
    id = pastSubscriptionIds[0];
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
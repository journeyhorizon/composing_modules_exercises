import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import {
  SUBSCRIPTION_NOT_FOUND_ERROR,
  INVALID_TRANSITION_ERROR
} from '../../../error';
import subscriptionSdk from "../../../subscription";
import {
  TRANSITION_CANCEL_SUBSCRIPTION,
  TRANSITION_RESTART_SUBSCRIPTION,
  TRANSITION_UPDATE_SUBSCRIPTION
} from "../transitions";
import { createFlexErrorObject } from "../../../error";

const transition = async ({
  data,
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const {
    transition,
    params
  } = data;

  const fnParams = {
    customerId: currentUser.id.uuid,
    params
  };

  switch (transition) {
    case TRANSITION_UPDATE_SUBSCRIPTION: {
      return subscriptionSdk.update(fnParams);
    }
    case TRANSITION_CANCEL_SUBSCRIPTION: {
      return subscriptionSdk.cancel(fnParams);
    }
    case TRANSITION_RESTART_SUBSCRIPTION: {
      return subscriptionSdk.resume(fnParams);
    }
    default: {
      return {
        code: 400,
        data: createFlexErrorObject({
          status: 400,
          message: INVALID_TRANSITION_ERROR
        })
      }
    }
  }
}

export default transition;
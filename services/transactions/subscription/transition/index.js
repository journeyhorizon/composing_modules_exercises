import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import {
  INVALID_TRANSITION_ERROR
} from '../../../error';
import { createFlexErrorObject } from "../../../error";
import { TRANSITION_CONFIRM_UPDATE_SAVED_PAYMENT_SUBSCRIPTION } from "../../util";
import { integrationSdk } from "../../../sharetribe_admin";

const transition = async ({
  data,
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show({
    include: [
      'stripeCustomer.defaultPaymentMethod'
    ]
  });
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const {
    transition,
    id
  } = data;


  const hasDefaultPaymentMethod = !!(
    currentUser.stripeCustomer.attributes.stripeCustomerId &&
    currentUser.stripeCustomer.defaultPaymentMethod.id
  );


  if (transition !== TRANSITION_CONFIRM_UPDATE_SAVED_PAYMENT_SUBSCRIPTION || !hasDefaultPaymentMethod) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: INVALID_TRANSITION_ERROR
      })
    }
  }

  return integrationSdk.transactions.updateMetadata({
    id: id,
    metadata: {
      paymentMethodNeedUpdate: false
    }
  });

}

export default transition;
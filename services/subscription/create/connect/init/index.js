import { composePromises, traceAsync } from "../../../../utils";
import createSubscriptionParams from "./create_params";
import { stripe } from "../../../../stripe";
import { STRIPE_INVALID_REQUEST_ERROR } from "../../../../error";
import initSubscriptionInternationalConnect from './init_international';

const initSubscription = (fnParams) => async ({
  customer,
  provider
}) => {

  const createSubscription = async (params) => stripe.subscriptions.create(params)
    .catch(e => {
      if (e && e.type === STRIPE_INVALID_REQUEST_ERROR &&
        e.message.includes(`Cannot create a destination charge for connected accounts in`)) {
        return initSubscriptionInternationalConnect(params);
      }
      throw (e);
    });

  return composePromises(
    createSubscriptionParams,
    createSubscription
  )({
    fnParams,
    customer,
    provider
  });
}

export default initSubscription;
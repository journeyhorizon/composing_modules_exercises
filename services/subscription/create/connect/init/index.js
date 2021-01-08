import { composePromises, traceAsync } from "../../../../utils";
import createSubscriptionParams from "./create_params";
import { stripe } from "../../../../stripe";

const initSubscription = (fnParams) => async ({
  customer,
  provider
}) => {
  
  return composePromises(
    createSubscriptionParams,
    traceAsync('test'),
    async (params) => stripe.subscriptions.create(params)
  )({
    fnParams,
    customer,
    provider
  });
}

export default initSubscription;
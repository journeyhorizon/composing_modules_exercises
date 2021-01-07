import { composePromises } from "../../../../utils";
import createSubscriptionParams from "./create_params";
import { stripe } from "../../../../stripe";

const initSubscription = (fnParams) => async ({
  customer,
  provider
}) => {
  return composePromises(
    createSubscriptionParams,
    stripe.subscriptions.create
  )({
    fnParams,
    customer,
    provider
  });
}

export default initSubscription;
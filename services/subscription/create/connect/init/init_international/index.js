import { composePromises } from "../../../../../utils";
import createSubscriptionParams from "./create_params";
import { stripe } from "../../../../../stripe";

const initSubscription = async (fnParams) => {
  return composePromises(
    createSubscriptionParams,
    async (params) => stripe.subscriptions.create(params)
  )(fnParams);
}

export default initSubscription;
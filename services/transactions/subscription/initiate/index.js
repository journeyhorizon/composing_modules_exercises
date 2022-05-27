import { composePromises, traceAsync } from "../../../utils";
import createRawInputParams from "./create_raw_input_params";
import createStripeProduct from "./create_stripe_product";
import transitionFlexTransaction from "./transition_flex_transition";
import wrappedSubscriptionCreate from "./wrapped_subscription_create";

const initiate = async ({
  data,
  clientTokenStore,
}) => {
  const {
    params,
    id,
    flexTransition
  } = data;

  return composePromises(
    createRawInputParams,
    createStripeProduct,
    wrappedSubscriptionCreate,
    transitionFlexTransaction({
      params,
      id,
      transition: flexTransition
    }),
  )({
    params,
    id,
    clientTokenStore
  });
}

export default initiate;
import { stripe } from "../../../stripe";
import createParams from "./create_params";

const updateSubscription = (fnParams) => async (subscription) => {
  const {
    params: {
      lineItems,
      protectedData
    }
  } = fnParams;

  return stripe.subscriptions.update(
    subscription.id.uuid,
    createParams({
      subscription,
      lineItems,
      protectedData
    }));
}

export default updateSubscription;
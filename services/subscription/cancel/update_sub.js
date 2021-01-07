import { stripe } from "../../stripe";

const handleUpdateSubscription = async ({
  subscriptionId,
  protectedData,
}) => {
  const params = {
    cancel_at_period_end: true,
  }

  if (protectedData) {
    params.metadata = {
      protectedData: JSON.stringify(protectedData),
    };
  }

  return stripe.subscriptions.update(subscriptionId, params);
}

export default handleUpdateSubscription;
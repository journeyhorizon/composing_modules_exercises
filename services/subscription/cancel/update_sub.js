import { stripe } from "../../stripe";

const handleUpdateSubscription = (clientParams = {}) => subscription => {
  const {
    protectedData
  } = clientParams;

  const params = {
    cancel_at_period_end: true,
  }

  if (protectedData) {
    params.metadata = {
      protectedData: JSON.stringify({
        ...subscription.attributes.protectedData,
        ...protectedData
      }),
    };
  }

  return stripe.subscriptions.update(subscription.id.uuid, params);
}

export default handleUpdateSubscription;
import { stripe } from "../../stripe";

const handleUpdateSubscription = async ({
  company,
  protectedData,
}) => {
  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = company;

  const params = {
    cancel_at_period_end: false,
  }

  if (protectedData) {
    params.metadata = {
      protectedData: JSON.stringify(protectedData),
    };
  }

  return stripe.subscriptions.update(subscription.id, params)
    .then(subscription => {
      return {
        company,
        subscription
      }
    });
}

const updateSubscription = fnParams => async (company) => {
  const {
    protectedData
  } = fnParams;

  const params = {
    protectedData,
    company,
  };


  return handleUpdateSubscription(params);
}

export default updateSubscription;
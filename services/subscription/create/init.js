import config from "../../config";
import { stripe } from "../../stripe";

const handleCreateNewSubscription = async ({
  company,
  items,
  protectedData,
  disableTrial
}) => {
  const params = {
    customer: company.stripeCustomer.id,
    items,
    metadata: {
      protectedData: JSON.stringify(protectedData),
      'sharetribe-user-id': company.id.uuid,
    }
  }

  if (!disableTrial) {
    params.trial_period_days = config.subscription.trialPeriod;
  }

  return stripe.subscriptions.create(params)
    .then(subscription => {
      return {
        company,
        subscription
      }
    });
}

const initSubscription = (fnParams) => async (company) => {
  const {
    params: {
      lineItems,
      protectedData
    }
  } = fnParams;

  const items = lineItems.map(({
    pricingId,
    quantity
  }) => {
    return {
      price: pricingId,
      quantity
    }
  });

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
    company,
    items,
    protectedData
  };

  if (subscription) {
    params.disableTrial = true;
  }

  return handleCreateNewSubscription(params);
}

export default initSubscription;
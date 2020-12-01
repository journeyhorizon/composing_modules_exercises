import { pick } from "lodash";
import config from "../../config";
import { stripe } from "../../stripe";
import { convertObjToCamelCase } from "../../utils";
import { SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE } from "../attributes";

const handleCreateNewSubscription = async ({
  company,
  items,
  protectedData
}) => {
  return stripe.subscriptions.create({
    customer: company.stripeCustomer.id,
    items,
    trial_period_days: config.subscription.trialPeriod,
    metadata: {
      protectedData: JSON.stringify(protectedData),
      'sharetribe-user-id': company.id.uuid,
    }
  })
    .then(data => {
      return {
        subscription: convertObjToCamelCase(pick(data,
          SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE)),
        company,
      };
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

  if (!subscription) {
    return handleCreateNewSubscription(params);
  } else {
    //TODO: Implement
    // return handleOverrideExistingSubscription(params);
  }
}

export default initSubscription;
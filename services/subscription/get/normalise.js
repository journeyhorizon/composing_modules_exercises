import { pick } from "lodash";
import { convertObjToCamelCase } from "../../utils";
import { DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE } from "../attributes";

const normalise = async (subscription) => {
  const subscriptionInCamelCase = convertObjToCamelCase(subscription);
  const {
    id,
    metadata,
    customer,
    ...rest
  } = subscriptionInCamelCase;
  return {
    id,
    stripeCustomer: {
      id: customer
    },
    attributes: {
      ...rest,
      items: subscription.items.data.map(item =>
        pick(item, DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE)),
      protectedData: metadata.protectedData
        ? JSON.parse(metadata.protectedData)
        : {}
    }
  }
}

export default normalise;
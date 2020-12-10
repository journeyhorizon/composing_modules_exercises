import { pick } from "lodash";
import { integrationSdk } from "../../../../sharetribe_admin";
import {
  SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
  SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE
} from "../../../../subscription/attributes";
import { OCEAN_PLAN } from "../../../../subscription/types";
import { convertObjToCamelCase } from "../../../../utils";

const updateFlexProfile = async ({
  company,
  subscription,
  activePorts
}) => {
  const {
    attributes: {
      profile: {
        metadata: {
          subscription: subscriptionMetadata
        }
      }
    }
  } = company;

  const subscriptionIsUpToDate = subscriptionMetadata.id === subscription.id;
  const isOldEvent = subscriptionMetadata.pastSubscriptionIds.includes(subscription.id)

  if (isOldEvent) {
    return;
  }

  const metadata = subscriptionIsUpToDate
    ? {
      subscription: {
        ...subscriptionMetadata,
        activePorts
      }
    }
    : {
      subscription: {
        ...subscriptionMetadata,
        status: subscription.status,
        id: subscription.id,
        plans: subscription.items.data.map(item => {
          return {
            ...convertObjToCamelCase(
              pick(item, SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE)
            ),
            currency: item.price.currency,
            nickname: item.price.nickname,
            billingScheme: item.price.billingScheme,
            price: convertObjToCamelCase(
              pick(item.price, SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE)
            )
          }
        }),
        type: OCEAN_PLAN,
        pastSubscriptionIds: subscriptionMetadata
          ? [...subscriptionMetadata.pastSubscriptionIds, subscriptionMetadata.id]
          : []
      }
    }

  return integrationSdk.users.updateProfile({
    id: company.id,
    metadata
  })
    .then(() => {
      return subscription;
    });
}

export default updateFlexProfile;
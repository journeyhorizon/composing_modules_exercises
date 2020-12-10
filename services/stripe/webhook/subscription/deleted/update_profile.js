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
  forcedClosePortIds
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
  return integrationSdk.users.updateProfile({
    id: company.id,
    metadata: {
      forcedClosePortIds,
      subscription: {
        ...subscriptionMetadata,
        activePorts: 0,
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
      }
    }
  })
    .then(() => {
      return subscription;
    });
}

export default updateFlexProfile;
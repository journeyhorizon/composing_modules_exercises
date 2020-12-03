import { pick } from "lodash";
import { integrationSdk } from "../../sharetribe_admin";
import { OCEAN_PLAN } from "../types";
import {
  SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE
} from '../attributes';

const updateFlexProfile = async ({
  company,
  subscription,
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
      subscription: {
        ...subscriptionMetadata,
        status: subscription.status,
        id: subscription.id,
        plans: subscription.items.data.map(item => {
          return {
            ...pick(item, SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE),
            currency: item.price.currency,
            nickname: item.price.nickname,
            billingScheme: item.price.billingScheme
          }
        }),
        type: OCEAN_PLAN,
        pastSubscriptionIds: subscriptionMetadata
          ? [...subscriptionMetadata.pastSubscriptionIds, subscriptionMetadata.id]
          : []
      }
    }
  })
    .then(() => {
      return subscription;
    });
}

export default updateFlexProfile;
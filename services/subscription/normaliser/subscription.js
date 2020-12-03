import { pick } from "lodash";
import {
  DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
  SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
  SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE
} from '../attributes';
import { types as sdkTypes } from '../../sharetribe';
import { convertObjToCamelCase } from "../../utils";
import {
  SUBSCRIPTION_BOOKING_TYPE,
  SUBSCRIPTION_STRIPE_CUSTOMER_TYPE,
  SUBSCRIPTION_TYPE
} from "../types";

const { UUID } = sdkTypes;

const normaliseSubscription = ({ data: rawSubscription }) => {
  const subscription = pick(rawSubscription, DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE);

  const subscriptionInCamelCase = convertObjToCamelCase(subscription);
  const {
    id,
    metadata,
    customer,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    currentPeriodStart,
    daysUntilDue,
    taxPercent,
    status,
  } = subscriptionInCamelCase;

  return {
    data: {
      id: new UUID(id),
      types: SUBSCRIPTION_TYPE,
      attributes: {
        taxPercent,
        status,
        items: subscription.items.data.map(item => {
          return {
            ...convertObjToCamelCase(
              pick(item, SUBSCRIPTION_ITEMS_ATTRIBUTES_TO_TAKE_FROM_STRIPE)
            ),
            price: convertObjToCamelCase(
              pick(item.price, SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE)
            )
          }
        }),
        protectedData: metadata.protectedData
          ? JSON.parse(metadata.protectedData)
          : {}
      },
      relationships: {
        stripeCustomer: {
          data: {
            id: new UUID(customer),
            type: SUBSCRIPTION_STRIPE_CUSTOMER_TYPE
          }
        },
        booking: {
          data: {
            id: new UUID(subscription.id),
            type: SUBSCRIPTION_BOOKING_TYPE,
          }
        }
      },
    },
    included: [
      {
        id: new UUID(customer),
        type: SUBSCRIPTION_STRIPE_CUSTOMER_TYPE
      },
      {
        id: new UUID(subscription.id),
        type: SUBSCRIPTION_BOOKING_TYPE,
        cancelAtPeriodEnd,
        daysUntilDue,
        start: new Date(currentPeriodStart * 1000),
        bookingStart: new Date(currentPeriodStart * 1000),
        end: new Date(currentPeriodEnd * 1000),
        bookingEnd: new Date(currentPeriodEnd * 1000)
      },
    ],
  }

}

export default normaliseSubscription;
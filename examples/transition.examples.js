import { sdk } from '../services/sharetribe';
import {
  TRANSITION_CANCEL_SUBSCRIPTION,
  TRANSITION_RESTART_SUBSCRIPTION,
  TRANSITION_UPDATE_SUBSCRIPTION
} from '../services/transactions/subscription/transitions';
import { SUBSCRIPTION_TYPE } from '../routes/flexApi/transactions/types';

/**
 * sdk endpoint should be set to the server
 */
const clientSubscriptionTransitionUpdate = async () => {
  const paramsSendToServer = {
    transition: TRANSITION_UPDATE_SUBSCRIPTION,
    params: {
      lineItems: [
        {
          quantity: 1, //Right now we only support changing quantity
          pricingId: 'PRICING-ID-OF-THE-CURRENT-SUBSCRIPTION'
        },
        //Or if we need to update new prices
        {
          quantity: 1,
          priceData: {
            listingId: '5ff7d62d-ad1e-435c-b3d2-0f3797388fc6',
            interval: {
              period: 'month',
              count: 1
            },
            price: {
              amount: 40000,
              currency: 'USD'
            }
          }
        }
      ]
    }
  }

  return sdk.transactions.transition(paramsSendToServer, {
    type: SUBSCRIPTION_TYPE
  })
}

const clientSubscriptionTransitionCancel = async () => {
  const paramsSendToServer = {
    id: 'subscription-id',
    transition: TRANSITION_CANCEL_SUBSCRIPTION
  }

  return sdk.transactions.transition(paramsSendToServer, {
    type: SUBSCRIPTION_TYPE
  })
}

const clientSubscriptionTransitionResume = async () => {
  const paramsSendToServer = {
    id: 'subscription-id',
    transition: TRANSITION_RESTART_SUBSCRIPTION
  }

  return sdk.transactions.transition(paramsSendToServer, {
    type: SUBSCRIPTION_TYPE
  })
}
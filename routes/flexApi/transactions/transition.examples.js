import { sdk } from '../../../services/sharetribe';
import {
  TRANSITION_CANCEL_SUBSCRIPTION,
  TRANSITION_RESTART_SUBSCRIPTION,
  TRANSITION_UPDATE_SUBSCRIPTION
} from '../../../services/transactions/subscription/transitions';
import { SUBSCRIPTION_TYPE } from './types';

//Pseudo code
const clientSubscriptionTransitionUpdate = async () => {
  const paramsSendToServer = {
    transition: TRANSITION_UPDATE_SUBSCRIPTION,
    params: {
      lineItems: [
        {
          quantity: 1, //Right now we only support changing quantity
          pricingId: 'PRICING-ID-OF-THE-CURRENT-SUBSCRIPTION'
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
import { sdk, types as sdkTypes } from '../services/sharetribe';
import { SUBSCRIPTION_TYPE } from '../routes/flexApi/transactions/types';

const { UUID } = sdkTypes;

/**
 * sdk endpoint should be set to the server
 */
const clientSubscriptionInitiate = async () => {
  const paramsSendToServer = {
    providerId: new UUID('authorId'), //Normal string would also be ok
    params: {
      bookingStartTime: 1610392000,
      bookingEndTime: 1617166800,
      commissionPercentage: 15,
      lineItems: [
        {
          quantity: 1,
          priceData: {
            listingId: '5ff7d62d-ad1e-435c-b3d2-0f3797388fc6',
            interval: {
              period: 'month',
              count: 1
            },
            price: {
              amount: 10000,
              currency: 'USD'
            }
          }
        }
      ]
    }
  }

  return sdk.transactions.initiate(paramsSendToServer, {
    type: SUBSCRIPTION_TYPE
  })
}
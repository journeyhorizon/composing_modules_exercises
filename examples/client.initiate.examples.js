import { sdk, types as sdkTypes } from '../services/sharetribe';
import { SUBSCRIPTION_TYPE } from '../routes/flexApi/transactions/types';
import productStripeSdk from '../services/product';

const { UUID } = sdkTypes;

/**
 * sdk endpoint should be set to the server
 */
const clientSubscriptionInitiate = async () => {

  /**
   * Remember to register the listing as a product on Stripe first
   * On the server there is an internal sdk to do that, it would be posted below
   * You can expose an endpoint to create the product when the listing is created
   * Or you can fix the logic of creating subscription and check if the current Stripe product exist 
   * If not use the internal sdk to create
   */

  //This line of code should be ran on server
  await productStripeSdk.create({
    id: listingId
  })
    .then(data => {
      console.log(data);
    });

  //Back to client 
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
            //For the sake of flexibility, we do not require the listing's author to be the provider
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
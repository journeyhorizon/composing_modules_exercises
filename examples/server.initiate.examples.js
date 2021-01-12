import productStripeSdk from "../services/product";
import subscriptionSdk from "../services/subscription";

const example = () => {
  const listingId = '5ff7d62d-ad1e-435c-b3d2-0f3797388fc6';

  productStripeSdk.create({
    id: listingId
  })
    .then(data => {
      console.log(data);
    });

  subscriptionSdk.create({
    providerId: '5ff7d618-352e-46a6-a24a-0f3c9857e52e',
    customerId: '5cab04d4-2a5c-4754-b8fa-241cff06d972',
    params: {
      bookingStartTime: 1610392000,
      bookingEndTime: 1617166800,
      commissionPercentage: 15,
      lineItems: [
        {
          quantity: 1,
          priceData: {
            listingId: listingId,
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
  })
    .then(data => {
      console.log(data);
    })
}

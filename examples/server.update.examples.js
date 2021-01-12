import subscriptionSdk from "../services/subscription";

const example = () => {
  subscriptionSdk.update({
    id: 'sub_IiiHcCCLS3jkpl',
    params: {
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
              amount: 60000,
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

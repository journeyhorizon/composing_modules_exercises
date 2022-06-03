import { stripe } from "../../../../stripe";

const createBulkPayout = (providerPayouts) => {
  const bulkPayout = [];
  for (const providerId in providerPayouts) {
    const { payoutParams, extendParams } = providerPayouts[providerId];
    const payout = stripe.payouts.create(payoutParams, extendParams);
    bulkPayout.push(payout);
  }

  return Promise.allSettled(bulkPayout);
}

export default createBulkPayout;
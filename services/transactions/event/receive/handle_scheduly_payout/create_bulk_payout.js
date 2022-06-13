import { stripe } from "../../../../stripe";

const createBulkPayout = async (providerPayouts) => {
  const bulkPayout = [];
  for (const providerId in providerPayouts) {
    const { payoutParams, extendParams } = providerPayouts[providerId];
    const payout = stripe.payouts.create({
      ...payoutParams,
      description: "JH code triggered payout for subscription"
    }, extendParams);
    
    bulkPayout.push(payout);
  }

  return Promise.allSettled(bulkPayout);;
}

export default createBulkPayout;
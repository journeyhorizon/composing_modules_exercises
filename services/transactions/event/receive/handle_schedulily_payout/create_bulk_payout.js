import { stripe } from "../../../../stripe";

const createBulkPayout = (customerPayouts) => {
  const bulkPayout = [];
  for (const customer in customerPayouts) {
    const payout = stripe.payouts.create(customerPayouts[customer]);
    bulkPayout.push(payout);
  }

  return Promise.allSettled(bulkPayout);
}

export default createBulkPayout;
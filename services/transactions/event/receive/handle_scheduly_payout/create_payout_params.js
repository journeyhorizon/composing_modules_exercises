const createPayoutParams = async (providerSubscriptions) => {
  const providerPayouts = {};

  for (const providerId in providerSubscriptions) {
    const { subscriptions, stripeAccountId } = providerSubscriptions[providerId];
    const totalPayout = subscriptions.reduce((total, subscription) => {
      const { amount = 0 } = total;
      const { items, application_fee_percent = 0 } = subscription;
      const totalSubscriptionPrice = 
        items.reduce((subscriptionTotalPrice, item) => subscriptionTotalPrice + item.price.unit_amount, 0);
      const providerCommission = Math.round(application_fee_percent / 100);

      return { amount: amount + (totalSubscriptionPrice * providerCommission), currency };
    }, {});
    providerPayouts[providerId] = { payoutParams: totalPayout, extendParams: { stripeAccount: stripeAccountId } };
  }

  return providerPayouts;
}

export default createPayoutParams;
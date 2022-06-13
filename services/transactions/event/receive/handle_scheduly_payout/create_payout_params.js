const createPayoutParams = async (providerSubscriptions) => {
  const providerPayouts = {};

  for (const providerId in providerSubscriptions) {
    const { subscriptions, stripeAccountId } = providerSubscriptions[providerId];
    const totalPayout = subscriptions.reduce((total, subscription) => {
      const { amount = 0 } = total;
      const { items, metadata: { application_fee_percent = 0 } } = subscription;
      const totalSubscriptionPrice =
        items.data.reduce((subscriptionTotalPrice, item) => subscriptionTotalPrice + item.price.unit_amount, 0);
      const formattedFeePercent = parseFloat(application_fee_percent);
      const providerCommission = formattedFeePercent / 100;
      const receivedAmountForThisSubscription = Math.round(totalSubscriptionPrice - (totalSubscriptionPrice * providerCommission))

      return {
        amount: amount + receivedAmountForThisSubscription,
        currency: items?.data[0]?.price?.currency,
      };
    }, {});
    providerPayouts[providerId] = { payoutParams: totalPayout, extendParams: { stripeAccount: stripeAccountId } };
  }

  return providerPayouts;
}

export default createPayoutParams;
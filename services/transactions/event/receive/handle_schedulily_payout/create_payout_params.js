const createPayoutParams = async (providerSubscriptions) => {
  const providerPayouts = {};

  for (const providerId in providerSubscriptions) {
    const { subscriptions, stripeAccountId } = providerSubscriptions[providerId];
    const totalPayout = subscriptions.reduce((total, items) => {
      const { amount = 0 } = total;
      const { unit_amount: priceUnitAmount, currency} = items.price;

      return { amount: amount + priceUnitAmount, currency };
    }, {});
    providerPayouts[providerId] = { payoutParams: totalPayout, extendParams: { stripeAccount: stripeAccountId } };
  }

  return providerPayouts;
}

export default createPayoutParams;
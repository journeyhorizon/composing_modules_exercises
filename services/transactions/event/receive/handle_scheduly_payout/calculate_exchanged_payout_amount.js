const calculateExchangedPayoutAmount = async ({
  providerPayouts,
  exchangeRates
}) => {
  for (const providerId in providerPayouts) {
    const { payoutParams, providerCurrency } = providerPayouts[providerId];
    if (providerCurrency !== payoutParams.currency) {
      providerPayouts[providerId].payoutParams = {
        amount: Math.round(payoutParams.amount * exchangeRates.rates[providerCurrency.toUpperCase()]),
        currency: providerCurrency
      }
    }
  }

  return providerPayouts;
}

export default calculateExchangedPayoutAmount;
import { stripe } from "../../../../../stripe";
import fetchExchangeRates from "./fetch_exchange_rates";

const fetchProvidersCurrencyRate = async (providerPayouts) => {
  const providerCurrencyPromises = [];
  for (const providerId in providerPayouts) {
    const { extendParams } = providerPayouts[providerId];
    const providerCurrency = await stripe.balance.retrieve({}, extendParams)
      .then(res => {
        providerPayouts[providerId].providerCurrency = res.available[0].currency;
        return res.available[0]?.currency;
      });

    providerCurrencyPromises.push(providerCurrency);
  }

  const providerCurrencyRaw = await Promise.allSettled(providerCurrencyPromises);
  const exchangeRates = await fetchExchangeRates(providerCurrencyRaw.map(res => res.value.toUpperCase()));
  return {
    providerPayouts,
    exchangeRates
  };
}

export default fetchProvidersCurrencyRate;
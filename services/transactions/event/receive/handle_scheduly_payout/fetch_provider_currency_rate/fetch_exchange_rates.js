import fetch from 'node-fetch';
import config from '../../../../../config'
import NodeCache from "node-cache";

const localCache = new NodeCache({
  stdTTL: 1296000, // 15 days
  checkperiod: 86400, // 1 day
});

const CURRENCY_RATES = 'exchange_rates';

const urlBuilder = ({ host, path, query }) => {
  const queryPath = Object.entries(query).reduce((currentQueryPath, [key, value]) => {
    if (currentQueryPath === '') {
      return `?${key}=${value}`;
    }
    return `${currentQueryPath}&${key}=${value}`;
  }, '');
  return `${host}${path}${queryPath}`
}

const fetchExchangeRates = async (symbols) => {
  return localCache.get(CURRENCY_RATES) || fetch(urlBuilder({
    host: config.currencyConfig.host,
    path: '/latest',
    query: {
      from: config.currencyConfig.baseCurrency,
      to: symbols.join(','),
    }
  }), {
    method: 'GET'
  })
    .then(response => response.json())
    .then(res => {
      localCache.set(CURRENCY_RATES, res);
      return res;
    });
}

export default fetchExchangeRates;
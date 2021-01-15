const env = process.env.SERVER_ENV;
const nodeEnv = process.env.NODE_ENV;
const retries = parseInt(process.env.HANDLE_REQUEST_RETRIES_TIME || 1);

const sharetribeFlex = {
  baseUrl: process.env.SHARETRIBE_SDK_BASE_URL ||
    'https://flex-api.sharetribe.com',
  integration: {
    clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
    secret: process.env.SHARETRIBE_FLEX_INTEGRATION_SECRET_ID
  },
  clientSdk: {
    clientId: process.env.SHARETRIBE_SDK_CLIENT_ID,
    secret: process.env.SHARETRIBE_SDK_SECRET_ID,
    transitVerbose: process.env.SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true'
  }
};

const stripe = {
  endpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
  connectEndpointSecret: process.env.STRIPE_CONNECT_ENDPOINT_SECRET,
  apiVersion: process.env.STRIPE_VERSION,
  secret: process.env.STRIPE_SECRET
};

const webCanonicalUrl = process.env.WEB_CANONICAL_URL;

const subscription = {
  trialPeriod: process.env.STRIPE_CUSTOMER_TRIAL_PERIOD
    ? parseInt(process.env.STRIPE_CUSTOMER_TRIAL_PERIOD)
    : null,
};

const aws = {
  region: process.env.SERVER_AWS_REGION,
};

const config = {
  env,
  nodeEnv,
  retries,
  sharetribeFlex,
  webCanonicalUrl,
  stripe,
  subscription,
  aws
}

export default config;
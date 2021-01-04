const env = process.env.SERVER_ENV;
const nodeEnv = process.env.NODE_ENV;
const retries = parseInt(process.env.HANDLE_REQUEST_RETRIES_TIME || 1);

const sharetribeFlex = {
  baseUrl: process.env.SHARETRIBE_SDK_BASE_URL ||
    'https://flex-api.sharetribe.com',
  integration: {
    clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
    secret: process.env.SHARETRIBE_FLEX_INTEGRATION_SECRET_ID,
    interval: {
      updateListings: process.env.SHARETRIBE_FLEX_INTERVAL_UPDATE_LISTINGS
        ? parseInt(process.env.SHARETRIBE_FLEX_INTERVAL_UPDATE_LISTINGS)
        : 60000,
    }
  },
  clientSdk: {
    clientId: process.env.SHARETRIBE_SDK_CLIENT_ID,
    secret: process.env.SHARETRIBE_SDK_SECRET_ID,
    transitVerbose: process.env.SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true'
  },
  page: {
    defaultEmailPrefix: process.env.DEFAULT_PAGE_EMAIL_PREFIX,
    defaultEmailSuffix: process.env.DEFAULT_PAGE_EMAIL_SUFFIX,
    secret: process.env.PASSWORD_SECRET,
    teamVerificationExpireTime: '7 days'
  },
  marketplaceName: env === 'production'
    ? "Ship Shop"
    : "Ship Shop Test"
};

const stripe = {
  endpointSecret: process.env.STRIPE_ENDPOINT_SECRET,
  connectEndpointSecret: process.env.STRIPE_CONNECT_ENDPOINT_SECRET,
  apiVersion: process.env.STRIPE_VERSION,
  secret: process.env.STRIPE_SECRET
};

const email = {
  senderAddress: process.env.SENDER_EMAIL_ADDRESS
    ? process.env.SENDER_EMAIL_ADDRESS
    : "tri.nguyen@journeyh.io",
  adminAddress: process.env.ADMIN_EMAIL_ADDRESS,
};

const sms = {
  accountSid: process.env.SMS_ACCOUNT_SID,
  authToken: process.env.SMS_AUTH_TOKEN,
  hostedNumber: process.env.SMS_HOSTED_NUMBER,
}

const aws = {
  ses: {
    region: process.env.AWS_SES_REGION
  },
  region: process.env.SERVER_AWS_REGION,
  dynamodb: {
    enterpriseTable: process.env.ENTERPRISE_CUSTOMER_TABLE,
  },
};

const webCanonicalUrl = process.env.WEB_CANONICAL_URL;

const enableSubscription = process.env.ENABLE_SUBSCRIPTION === 'true';

const subscription = enableSubscription
  ? {
    enable: true,
    endSubscriptionTrialImmediately: env !== 'production' &&
      process.env.STRIPE_SHOULD_END_SUBSCRIPTION_TRIAL_IMMEDIATELY === 'true'
      ? true
      : false,
    trialPeriod: process.env.STRIPE_CUSTOMER_TRIAL_PERIOD
      ? parseInt(process.env.STRIPE_CUSTOMER_TRIAL_PERIOD)
      : null,
    endSubscriptionImmediately: env !== 'production' &&
      process.env.STRIPE_SHOULD_END_SUBSCRIPTION_IMMEDIATELY === 'true',
  }
  : {
    enable: false
  };

const config = {
  env,
  nodeEnv,
  retries,
  sharetribeFlex,
  email,
  aws,
  webCanonicalUrl,
  sms,
  stripe,
  subscription
}

export default config;
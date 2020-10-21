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
  },
  page: {
    defaultEmailPrefix: process.env.DEFAULT_PAGE_EMAIL_PREFIX,
    defaultEmailSuffix: process.env.DEFAULT_PAGE_EMAIL_SUFFIX,
    secret: process.env.PASSWORD_SECRET,
    teamVerificationExpireTime: '7 days'
  }
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
};

const webCanonicalUrl = process.env.WEB_CANONICAL_URL;

const config = {
  env,
  nodeEnv,
  retries,
  sharetribeFlex,
  email,
  aws,
  webCanonicalUrl,
  sms
}

export default config;
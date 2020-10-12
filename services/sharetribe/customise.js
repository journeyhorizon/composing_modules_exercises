
import {
  types as flexType,
  createInstance,
  tokenStore as flexTokenStore
} from 'sharetribe-flex-sdk';
import Decimal from 'decimal.js';
import cloneDeep from 'lodash/cloneDeep';
import config from '../config';

const CLIENT_ID = config.sharetribeFlex.clientSdk.clientId;
const CLIENT_SECRET = config.sharetribeFlex.clientSdk.secret;
const BASE_URL = config.sharetribeFlex.baseUrl;
const TRANSIT_VERBOSE = config.sharetribeFlex.clientSdk.transitVerbose;

const baseUrl = BASE_URL ? { baseUrl: BASE_URL } : {};

const createTrustedSdkInstance = ({ tokenStore }) => {
  return createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    tokenStore,
    typeHandlers: [
      {
        type: flexType.BigDecimal,
        customType: Decimal,
        writer: v => new flexType.BigDecimal(v.toString()),
        reader: v => new Decimal(v.value),
      },
    ],
    ...baseUrl,
  });
}

const initiateTokenStore = (clientTokenStore) => {
  const tokenStore = flexTokenStore.memoryStore();
  tokenStore.setToken(clientTokenStore);
  return tokenStore;
}

const createSdkFunc = (sdkPath, sdk) => {
  if (!Array.isArray(sdkPath)) {
    throw (new Error(`Expected array for sdkPath got ${sdkPath}`));
  }
  if (sdkPath.length === 0) {
    return sdk;
  }
  const clonedPath = cloneDeep(sdkPath);
  const currentPath = clonedPath.shift();
  const currentSdk = sdk[currentPath];
  return clonedPath.length === 0
    ? currentSdk
    : createSdkFunc(clonedPath, currentSdk);
}

const postTrustedAction = ({
  clientTokenStore,
  path,
  params = {},
  queryParams = {},
  perRequestOpts = {} }) => {

  const clientSdkInstance = createTrustedSdkInstance({
    tokenStore: initiateTokenStore(clientTokenStore)
  });

  return clientSdkInstance.exchangeToken()
    .then(response => {
      // Setup a trusted sdk with the token we got from the exchange:
      const token = response.data;
      // Important! Do not use a cookieTokenStore here but a memoryStore
      // instead so that we don't leak the token back to browser client.
      const tokenStore = initiateTokenStore(token);
      const trustedSdk = createTrustedSdkInstance({ tokenStore });

      return createSdkFunc(path, trustedSdk)(params, queryParams, perRequestOpts);
    });
}

const invokeTrustedTx = ({ simulate }) => ({
  processAlias,
  transition,
  params,
  clientQueryParams,
  clientTokenStore }) => {
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  }

  const invokeParams = {
    processAlias,
    transition,
    params
  };

  // Invoke the transition, now with a trusted sdk.
  return postTrustedAction({
    path: ['transactions', simulate ? 'initiateSpeculative' : 'initiate'],
    params: invokeParams,
    queryParams,
    clientTokenStore
  });
}

const sdk = {};

sdk.trustedTransactions = {
  initiate: invokeTrustedTx({ simulate: false }),
  initiateSpeculative: invokeTrustedTx({ simulate: true }),
  transitionSpeculative: ({ clientTokenStore, clientQueryParams, ...rest }) => {
    const { include = '', expand } = clientQueryParams;

    const queryParams = {
      expand: expand === 'true' ? true : false,
      include: include.split(',')
    };

    return postTrustedAction({
      path: ['transactions', 'transitionSpeculative'],
      params: {
        ...rest
      },
      queryParams,
      clientTokenStore
    });
  },
  transition: ({ clientTokenStore, clientQueryParams, ...rest }) => {
    const { include = '', expand } = clientQueryParams;

    const queryParams = {
      expand: expand === 'true' ? true : false,
      include: include.split(',')
    };

    return postTrustedAction({
      path: ['transactions', 'transition'],
      params: {
        ...rest
      },
      queryParams,
      clientTokenStore
    });
  },
};

export default sdk;
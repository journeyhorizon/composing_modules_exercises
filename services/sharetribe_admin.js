import config from './config';

const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { types } = require('./sharetribe');
const { UUID } = types;

// Create new SDK instance
export const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: config.sharetribeFlex.integration.clientId,
  clientSecret: config.sharetribeFlex.integration.secret
});

export const getFlexMappedIncludedData = response => {
  if (!response || !response.data)
    return null;
  const { data, included } = response.data;
  if (!included)
    return data;
  const mapIncludedFlexData = mapIncludedForSingleFlexData(included);
  if (Array.isArray(data)) {
    return data.map(item => {
      return mapIncludedFlexData(item);
    });
  } else {
    return mapIncludedFlexData(data);
  }
}

const mapIncludedForSingleFlexData = included => data => {
  const { relationships, ...flexData } = data;

  if (!relationships) {
    return flexData;
  }

  const currentRelationships = [];

  Object.entries(relationships).forEach(([key, value]) => {
    const currentData = value.data;
    if (currentData) {
      const keyAttributes = included.find(item =>
        item.id.uuid === currentData.id.uuid &&
        item.type === currentData.type);
      flexData[`${key}`] = keyAttributes;
      currentRelationships.push(key);
    }
  });

  currentRelationships.forEach(relationshipKey => {
    flexData[`${relationshipKey}`] =
      mapIncludedForSingleFlexData(included)(flexData[`${relationshipKey}`]);
  })

  return flexData;
}

export const getTransaction = ({
  transactionId,
  include = ['provider', 'customer', 'booking']
}) =>
  integrationSdk.transactions.show({
    id: transactionId,
    include,
  }).then(response => getFlexMappedIncludedData(response));

export const getUserData = ({ user, userId, include = ['profileImage'] }) =>
  integrationSdk.users.show({
    id: userId || user.id.uuid,
    include,
  }).then(response => {
    return getFlexMappedIncludedData(response)
  });

export const getListingData = ({ listingId, include = ['author'] }) =>
  integrationSdk.listings
    .show({
      id: listingId instanceof UUID
        ? listingId.uuid
        : listingId, include
    })
    .then(response => getFlexMappedIncludedData(response));
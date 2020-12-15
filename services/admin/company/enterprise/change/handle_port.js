import {
  PAGE_LISTING_TYPE,
  LISTING_STATE_PUBLISHED,
  LISTING_STATE_CLOSED
} from "../../../../on_behalf_of/types";
import { denormalisedResponseEntities } from "../../../../sharetribe";
import { integrationSdk } from "../../../../sharetribe_admin";
import { types as sdkTypes } from '../../../../sharetribe';

const { UUID } = sdkTypes;

const fetchPageListings = async ({ authorId, state }) => {
  const params = {
    authorId,
    pub_listingType: PAGE_LISTING_TYPE,
    states: state
  };

  const listingsRes = await integrationSdk.listings.query(params);
  const listings = denormalisedResponseEntities(listingsRes);
  return listings;
}

const openExistingPortsListing = async ({
  company,
  fnParams
}) => {
  const { quantity } = fnParams;

  const maximumPort = quantity;

  const openPortListings = await fetchPageListings({
    authorId: company.id.uuid,
    state: LISTING_STATE_PUBLISHED
  });

  if (openPortListings.length > 0) {
    console.error(`Something is wrong with subscription, why there is an open port when the subscription has just been created?`);
    return {
      activePorts: openPortListings.length,
      company,
      fnParams
    };
  }

  const { forcedClosePortIds = [] } = company.attributes.profile.metadata;

  if (forcedClosePortIds.length === 0) {
    return {
      activePorts: forcedClosePortIds.length,
      company,
      fnParams
    };
  }

  const allPortListings = await fetchPageListings({
    authorId: company.id.uuid,
    state: LISTING_STATE_CLOSED
  });

  const portListings = allPortListings.filter(portListing => {
    return forcedClosePortIds.includes(portListing.id.uuid);
  });

  const activePorts = maximumPort > portListings.length
    ? portListings.length
    : maximumPort;

  for (let i = 0; i < activePorts; i++) {
    const portListing = portListings[i];
    const { stateMap } = portListing.attributes.privateData;

    await Promise.all(stateMap.map(l => {
      if (l.state === LISTING_STATE_PUBLISHED) {
        return integrationSdk.listings.open({
          id: new UUID(l.id)
        });
      } else {
        return Promise.resolve();
      }
    }));

    await integrationSdk.listings.open({
      id: portListing.id
    });
  }

  return {
    activePorts,
    company,
    fnParams
  };
}

export default openExistingPortsListing;
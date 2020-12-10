import {
  PAGE_LISTING_TYPE,
  LISTING_STATE_PUBLISHED,
  LISTING_STATE_CLOSED
} from "../../../../on_behalf_of/types";
import { denormalisedResponseEntities } from "../../../../sharetribe";
import { integrationSdk } from "../../../../sharetribe_admin";
import { types as sdkTypes } from '../../../../sharetribe';
import { convertObjToCamelCase } from "../../../../utils";

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
  subscription: rawSubscription
}) => {
  const subscription = convertObjToCamelCase(rawSubscription);
  const tieredPlan = subscription.items.data.find(plan => plan.price.billingScheme === 'tiered');
  const maximumPort = tieredPlan.quantity;

  const openPortListings = await fetchPageListings({
    authorId: company.id.uuid,
    state: LISTING_STATE_PUBLISHED
  });

  if (openPortListings.length > 0) {
    console.error(`Something is wrong with ${subscription.id}, why there is an open port when the subscription has just been created?`);
    return { activePorts: openPortListings.length };
  }

  const { forcedClosePortIds = [] } = company.attributes.profile.metadata;

  if (forcedClosePortIds.length === 0) {
    return {
      activePorts: forcedClosePortIds.length
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

  return { activePorts };
}

export default openExistingPortsListing;
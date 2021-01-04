import { LISTING_STATE_PUBLISHED } from "../../../../../on_behalf_of/types";
import { types as sdkTypes } from "../../../../../sharetribe";
import { getListingData, integrationSdk } from "../../../../../sharetribe_admin";

const { UUID } = sdkTypes;

const handlePortOpened = async ({ id }) => {
  const listing = await getListingData({ listingId: id });

  if (listing.attributes.state !== LISTING_STATE_PUBLISHED) {
    return;
  }

  const { stateMap = [] } = listing.attributes.privateData;
  await Promise.all(stateMap.map(l => {
    if (l.state === LISTING_STATE_PUBLISHED) {
      return integrationSdk.listings.open({
        id: new UUID(l.id)
      })
        .catch(e => {
          //catch it in case the products are deleted
          console.log(e);
        });
    } else {
      return Promise.resolve();
    }
  }));

  return integrationSdk.listings.update({
    id: listing.id,
    privateData: {
      stateMap: []
    }
  });

}

export default handlePortOpened;
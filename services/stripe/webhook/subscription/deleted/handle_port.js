import {
  PRODUCT_LISTING_TYPE,
  PAGE_LISTING_TYPE,
  LISTING_STATE_PUBLISHED
} from "../../../../on_behalf_of/types";
import { denormalisedResponseEntities } from "../../../../sharetribe";
import { integrationSdk } from "../../../../sharetribe_admin";

const createProductListingStateMap = listings => {
  return listings.map(l => {
    return {
      id: l.id.uuid,
      state: l.attributes.state
    };
  });
}

const fetchPageProductListings = async ({ authorId, pageListingId }) => {
  const params = {
    authorId,
    state: LISTING_STATE_PUBLISHED,
    pub_listingType: PRODUCT_LISTING_TYPE
  };

  if (pageListingId) {
    params.pub_idListingPage = pageListingId;
  }

  const listingsRes = await integrationSdk.listings.query(params);
  const listings = denormalisedResponseEntities(listingsRes);
  return listings;
}

const fetchPageListings = async ({ authorId }) => {
  const params = {
    authorId,
    state: LISTING_STATE_PUBLISHED,
    pub_listingType: PAGE_LISTING_TYPE
  };

  const listingsRes = await integrationSdk.listings.query(params);
  const listings = denormalisedResponseEntities(listingsRes);
  return listings;
}

const updateListingStateData = ({
  listingId,
  stateMap
}) => {
  return integrationSdk.listings.update({
    id: listingId,
    privateData: {
      stateMap
    }
  });
}

const closeListing = async ({
  listings,
}) => {
  return Promise.all(listings.map(l => {
    if (l.attributes.state === LISTING_STATE_PUBLISHED) {
      return integrationSdk.listings.close({ id: l.id });
    }
    return Promise.resolve();
  }));
}

const closeAllPortsListing = async ({
  company
}) => {
  const portListings = await fetchPageListings({
    authorId: company.id.uuid
  });

  portListings.forEach(async (portListing) => {
    const productListings = await fetchPageProductListings({
      authorId: company.id.uuid,
      pageListingId: portListing.id.uuid
    });
    const productListingStateMap = createProductListingStateMap(productListings);

    return await Promise.all([
      closeListing({
        listings: [
          ...productListings,
          portListing
        ],
      }),
      updateListingStateData({
        listingId: portListing.id,
        stateMap: productListingStateMap
      }),
    ]);
  })

  return portListings.map(portListing => portListing.id.uuid);
}

export default closeAllPortsListing;
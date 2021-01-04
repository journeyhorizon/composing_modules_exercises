import { LISTING_STATE_PUBLISHED } from "../../../../../on_behalf_of/types";
import { fetchFormattedPageProducts } from "../../../../../sharetribe/utils";
import { types as sdkTypes } from "../../../../../sharetribe";
import { integrationSdk } from "../../../../../sharetribe_admin";

const { UUID } = sdkTypes;

const createProductListingStateMap = listings => {
  return listings.map(l => {
    return {
      id: l.id.uuid,
      state: l.attributes.state
    };
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

const handlePortClosure = async ({ id, authorId, deleted }) => {
  const products = await fetchFormattedPageProducts({
    authorId,
    pageListingId: id
  });

  await closeListing({
    listings: products
  });

  if (deleted) {
    return;
  }

  const productListingStateMap = createProductListingStateMap(products);

  return integrationSdk.listings.update({
    id: new UUID(id),
    privateData: {
      stateMap: productListingStateMap
    }
  });
}

export default handlePortClosure;
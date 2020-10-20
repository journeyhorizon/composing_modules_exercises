import { WRONG_PARAMS } from "../../error_type";
import { denormalisedResponseEntities, sdk } from "../../sharetribe";
import { getListingData, integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { LISTING_STATE_CLOSED, LISTING_STATE_DRAFT, LISTING_STATE_PENDING_APPROVAL, LISTING_STATE_PUBLISHED, PAGE_LISTING_TYPE, PRODUCT_LISTING_TYPE } from "../types";

const fetchAllUserListing = async ({ authorId }) => {
  const listingsRes = await integrationSdk.listings.query({
    authorId,
    pub_listingType: PRODUCT_LISTING_TYPE
  });
  const listings = denormalisedResponseEntities(listingsRes);
  return listings;
}

const createProductListingStateMap = listings => {
  return listings.map(l => {
    return {
      id: l.id.uuid,
      state: l.attributes.state
    };
  });
}

const closeListing = async ({
  data,
  productListings,
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  await Promise.all(productListings.map(l => {
    if (l.attributes.state === LISTING_STATE_PUBLISHED) {
      return trustedSdk.ownListings.close({ id: l.id });
    }
    return Promise.resolve();
  }));

  return trustedSdk.ownListings.close(data, queryParams);
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

const handleClosePageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const productListings = await fetchAllUserListing({ authorId: listing.author.id.uuid });
  const productListingStateMap = createProductListingStateMap(productListings);
  const [closeResult] = await Promise.all([
    closeListing({
      data,
      listing,
      productListings,
      clientTokenStore,
      clientQueryParams
    }),
    updateListingStateData({
      listingId: listing.id,
      stateMap: productListingStateMap
    })
  ]);

  return closeResult;
}

const close = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const listing = await getListingData({ listingId: data.id.uuid });
  const { publicData } = listing.attributes;
  const {
    listingType
  } = publicData;

  if (listing.attributes.state === LISTING_STATE_CLOSED ||
    listing.attributes.state === LISTING_STATE_PENDING_APPROVAL ||
    listing.attributes.state === LISTING_STATE_DRAFT) {
    const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
    const { include = '', expand } = clientQueryParams;

    const queryParams = {
      expand: expand === 'true' ? true : false,
      include: include.split(',')
    };
    //We let Flex handle how they want to display these error
    return trustedSdk.ownListings.close(data, queryParams);
  }

  switch (listingType) {
    case PAGE_LISTING_TYPE: {
      return handleClosePageListing({
        data,
        listing,
        clientTokenStore,
        clientQueryParams
      });
    }
    default: {
      return {
        code: 400,
        data: createFlexErrorObject({
          message: WRONG_PARAMS,
          messageCode: WRONG_PARAMS,
          status: 400
        })
      };
    }
  }

}

export default close;
import { WRONG_PARAMS } from "../../error_type";
import { sdk, types as sdkTypes } from "../../sharetribe";
import { getListingData } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { LISTING_STATE_PUBLISHED, PAGE_LISTING_TYPE } from "../types";

const { UUID } = sdkTypes;

const handleOpenPageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const { stateMap } = listing.attributes.privateData;
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  await Promise.all(stateMap.map(l => {
    if (l.state === LISTING_STATE_PUBLISHED) {
      return trustedSdk.ownListings.open({
        id: new UUID(l.id)
      });
    } else {
      return Promise.resolve();
    }
  }));

  return trustedSdk.ownListings.open(data, queryParams);
}

const open = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const listing = await getListingData({ listingId: data.id.uuid });
  const { publicData } = listing.attributes;
  const {
    listingType
  } = publicData;

  if (listing.attributes.state === LISTING_STATE_PUBLISHED) {
    const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
    const { include = '', expand } = clientQueryParams;

    const queryParams = {
      expand: expand === 'true' ? true : false,
      include: include.split(',')
    };
    //We let Flex handle how they want to display these error
    return trustedSdk.ownListings.open(data, queryParams);
  }


  switch (listingType) {
    case PAGE_LISTING_TYPE: {
      return handleOpenPageListing({
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

export default open;
import { WRONG_PARAMS } from "../../error_type";
import { sdk } from "../../sharetribe";
import { getListingData } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { PAGE_LISTING_TYPE, PRODUCT_LISTING_TYPE } from "../types";

const handlePublishPageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };
  const publishResult = await trustedSdk.ownListings
    .publishDraft(data, queryParams);

  return {
    code: 200,
    data: publishResult
  };
}
//TODO: Wait for product creation
const handlePublishProductListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };
  const publishResult = await trustedSdk.ownListings
    .publishDraft(data, queryParams);

  return {
    code: 200,
    data: publishResult
  };
}

const publishDraft = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const listing = await getListingData({ listingId: data.id.uuid });
  const { publicData, metadata } = listing.attributes;
  const {
    listingType
  } = publicData;
  switch (listingType) {
    case PAGE_LISTING_TYPE: {
      return handlePublishPageListing({
        data,
        listing,
        clientTokenStore,
        clientQueryParams
      });
    }
    case PRODUCT_LISTING_TYPE: {
      return handlePublishProductListing({
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

export default publishDraft;
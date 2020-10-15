import { WRONG_PARAMS } from "../../error_type";
import { sdk } from "../../sharetribe";
import { getListingData, integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { LISTING_STATE_CLOSED, LISTING_STATE_PUBLISHED, PRODUCT_LISTING_TYPE } from "../types";

const handlePublishProductListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const author = listing.author;
  const pageListing = await getListingData({
    listingId: author.attributes.profile.publicData.idListingPage
  });
  const {
    state
  } = pageListing.attributes;

  const publishListing = async () => {
    const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
    const { include = '', expand } = clientQueryParams;

    const queryParams = {
      expand: expand === 'true' ? true : false,
      include: include.split(',')
    };

    const publishResult = await trustedSdk.ownListings
      .publishDraft(data, queryParams);

    return publishResult;
  }

  const handleListingApprovalState = async () => {
    try {
      await integrationSdk.listings.approve(data);
      if (state === LISTING_STATE_CLOSED) {
        await integrationSdk.listings.close(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (state !== LISTING_STATE_PUBLISHED && state !== LISTING_STATE_CLOSED) {
    return publishListing();
  }

  const publishResult = await publishListing();

  handleListingApprovalState();

  return publishResult;
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
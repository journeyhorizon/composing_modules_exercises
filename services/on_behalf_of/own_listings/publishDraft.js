import { WRONG_PARAMS } from "../../error_type";
import { denormalisedResponseEntities, sdk } from "../../sharetribe";
import { getListingData, integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import {
  LISTING_STATE_CLOSED,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
  PRODUCT_LISTING_TYPE,
  PAGE_LISTING_TYPE
} from "../types";
import {
  MAXIMUM_ACTIVE_PORT_REACHED_ERROR
} from '../../error_type';
import {
  SUBSCRIPTION_CANCELLED_STATE,
  SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE,
  SUBSCRIPTION_INCOMPLETE_STATE,
  SUBSCRIPTION_PAST_DUE_STATE,
  SUBSCRIPTION_UNPAID_STATE
} from "../../subscription/types";

const publishListing = async ({
  data,
  trustedSdk,
  clientQueryParams
}) => {
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  const publishResult = await trustedSdk.ownListings
    .publishDraft(data, queryParams);

  return publishResult;
}

const handlePublishProductListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const { idListingPage } = listing.attributes.publicData;
  const pageListing = await getListingData({
    listingId: idListingPage
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
      if (state === LISTING_STATE_PENDING_APPROVAL) {
        return;
      }
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

const handlePublishPageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = currentUser;

  const {
    status,
    plans,
    activePorts = 0
  } = subscription;

  const tieredPlan = plans.find(plan => plan.price.billingScheme === 'tiered');
  const maximumPort = tieredPlan.quantity;

  if (activePorts >= maximumPort ||
    status === SUBSCRIPTION_CANCELLED_STATE ||
    status === SUBSCRIPTION_INCOMPLETE_STATE ||
    status === SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE ||
    status === SUBSCRIPTION_PAST_DUE_STATE ||
    status === SUBSCRIPTION_UNPAID_STATE) {
    return {
      code: 403,
      data: createFlexErrorObject({
        status: 403,
        message: MAXIMUM_ACTIVE_PORT_REACHED_ERROR,
        messageCode: MAXIMUM_ACTIVE_PORT_REACHED_ERROR
      })
    };
  }

  subscription.activePorts = activePorts + 1;

  await integrationSdk.users.updateProfile({
    id: currentUser.id,
    metadata: {
      subscription
    }
  });

  return publishListing({
    data,
    trustedSdk,
    clientQueryParams
  });
}

const publishDraft = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const listing = await getListingData({ listingId: data.id.uuid });
  const { publicData } = listing.attributes;
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
    case PAGE_LISTING_TYPE: {
      return handlePublishPageListing({
        data,
        listing,
        clientTokenStore,
        clientQueryParams,
      })
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
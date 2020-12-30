import { MAXIMUM_ACTIVE_PORT_REACHED_ERROR, WRONG_PARAMS } from "../../error_type";
import { denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { getListingData, integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { LISTING_STATE_PENDING_APPROVAL, LISTING_STATE_PUBLISHED, PAGE_LISTING_TYPE } from "../types";
import {
  SUBSCRIPTION_CANCELLED_STATE,
  SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE,
  SUBSCRIPTION_INCOMPLETE_STATE,
  SUBSCRIPTION_PAST_DUE_STATE,
  SUBSCRIPTION_UNPAID_STATE
} from "../../subscription/types";

const { UUID } = sdkTypes;

const handleOpenPageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
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

  const { stateMap = [] } = listing.attributes.privateData;
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  await Promise.all(stateMap.map(l => {
    if (l.state === LISTING_STATE_PUBLISHED) {
      return trustedSdk.ownListings.open({
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

  return trustedSdk.ownListings.open(data, queryParams)
    .then(res => {
      trustedSdk.ownListings.update({
        id: listing.id,
        privateData: {
          stateMap: []
        }
      });
      return res;
    });
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
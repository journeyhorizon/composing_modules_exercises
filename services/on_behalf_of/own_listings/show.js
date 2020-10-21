import { denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { getUserData } from "../../sharetribe_admin";
import { PAGE_LISTING_TYPE } from "../types";

const { UUID } = sdkTypes;

const getTeamMembersData = async ({
  listing
}) => {
  const author = listing.author;
  const { teamMemberIds } = author.attributes.profile.publicData;
  return Promise.all(teamMemberIds.map(userId => {
    const params = {
      userId,
      include: ['profileImage']
    };
    return getUserData(params)
  }));
}

const show = async ({
  clientQueryParams,
  clientTokenStore,
}) => {
  const { id, ...rest } = clientQueryParams;

  const createQueryParams = (queries) => {
    return Object.entries(queries).reduce((result, [currentKey, currentValue]) => {
      result[currentKey] = currentValue.split(',');
      return result;
    }, {});
  }
  const additionalQueryParams = createQueryParams(rest);

  const params = {
    id: new UUID(id),
    ...additionalQueryParams
  };

  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const res = await trustedSdk.ownListings.show(params);
  const listing = denormalisedResponseEntities(res)[0];

  if (listing.attributes.publicData.listingType !== PAGE_LISTING_TYPE) {
    return res;
  }

  res.data.data.teamMembers = await getTeamMembersData({
    listing
  });

  return res;
}

export default show;
import { denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { getUserData } from "../../sharetribe_admin";
import { PAGE_LISTING_TYPE, LISTING_INCLUDE_PRODUCTS, PRODUCT_LISTING_TYPE } from "../types";
import { integrationSdk } from "../../sharetribe_admin";

const { UUID } = sdkTypes;

const fetchAllPageProduct = async ({
  authorId,
  page = 1,
  perPage = 100,
  pageListingId
}) => {
  const params = {
    page,
    per_page: perPage,
    'fields.listing': [
      'description',
      'geolocation',
      'price',
      'title',
      'publicData',
      'metadata',
      'images',
      'state',
    ],
    include: ['images'],
    'fields.image': [
      // Listing page
      'variants.landscape-crop',
      'variants.landscape-crop2x',
      'variants.landscape-crop4x',
      'variants.landscape-crop6x',

      // Social media
      'variants.facebook',
      'variants.twitter',

      // Image carousel
      'variants.scaled-small',
      'variants.scaled-medium',
      'variants.scaled-large',
      'variants.scaled-xlarge',

      // Avatars
      'variants.square-small',
      'variants.square-small2x',
    ],
    pub_listingType: PRODUCT_LISTING_TYPE,
    authorId,
  }

  if (pageListingId) {
    params.pub_idListingPage = pageListingId;
  }

  const res = await integrationSdk.listings
    .query(params);
  const { meta } = res.data;
  const {
    totalPages
  } = meta;

  if (page >= totalPages) {
    return res;
  }
  const nextData = await fetchAllPageProduct({
    authorId,
    pageListingId,
    page: page + 1
  });
  res.data.data = res.data.data.concat(nextData.data.data);
  res.data.included = res.data.included.concat(nextData.data.included)
  return res;
}

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

  const { include = [] } = additionalQueryParams;
  if (include.includes(LISTING_INCLUDE_PRODUCTS)) {
    const productsRes = await fetchAllPageProduct({
      authorId: listing.author.id.uuid,
      pageListingId: listing.id.uuid,
    });
    if (productsRes.data.data.length > 0) {
      res.data.data.products = denormalisedResponseEntities(productsRes);
    }
  }

  res.data.data.teamMembers = await getTeamMembersData({
    listing
  });

  return res;
}

export default show;
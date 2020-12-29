import { denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { integrationSdk } from "../../sharetribe_admin";

const fetchAllPortOrProductListings = async ({
  authorId,
  page = 1,
  perPage = 100,
  listingType,
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
    pub_listingType: listingType,
    authorId,
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
  const nextData = await fetchAllPortOrProductListings({
    authorId,
    page: page + 1
  });
  res.data.data = res.data.data.concat(nextData.data.data);
  res.data.included = res.data.included.concat(nextData.data.included)
  return res;
}

const query = async ({
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

  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const { listingType } = additionalQueryParams;
  const res = await fetchAllPortOrProductListings({
    authorId: currentUser.id.uuid,
    listingType,
  });

  return res;
}

export default query;
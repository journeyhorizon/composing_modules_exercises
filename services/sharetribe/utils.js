import { denormalisedResponseEntities, sdk } from ".";
import { PRODUCT_LISTING_TYPE } from "../on_behalf_of/types";

export const fetchAllPageProduct = async ({
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

export const fetchFormattedPageProducts = async ({
  authorId,
  page = 1,
  perPage = 100
}) => {
  const res = await fetchAllPageProduct({
    authorId,
    page,
    perPage
  });

  return denormalisedResponseEntities(res);
}
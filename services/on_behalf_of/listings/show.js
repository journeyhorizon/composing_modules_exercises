import { denormalisedEntities, denormalisedResponseEntities, sdk, types as sdkTypes } from "../../sharetribe";
import { PAGE_LISTING_TYPE, PRODUCT_LISTING_TYPE } from "../types";

const { UUID } = sdkTypes;

const fetchAllPageProduct = async ({
  authorId,
  page = 1,
  perPage = 100
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
      'images'
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
    authorId
  }
  const res = await sdk.listings
    .query(params);
  const { meta } = res.data;
  const {
    totalPages
  } = meta;
  
  if (page === totalPages) {
    return res;
  }
  const nextData = await fetchAllPageProduct({
    authorId,
    page: page + 1
  });
  res.data.data = res.data.data.concat(nextData.data.data);
  res.data.included = res.data.included.concat(nextData.data.included)
  return res;
}

const show = async ({
  clientQueryParams
}) => {
  const { id, expand, ...rest } = clientQueryParams;

  const createQueryParams = (queries) => {
    return Object.entries(queries).reduce((result, [currentKey, currentValue]) => {
      result[currentKey] = currentValue.split(',');
      return result;
    }, {});
  }

  const additionalQueryParams = createQueryParams(rest);

  const params = {
    id: new UUID(id),
    expand: expand === 'true' ? true : false,
    ...additionalQueryParams
  };

  const res = await sdk.listings.show(params);
  const listing = denormalisedResponseEntities(res)[0];
  if (listing.attributes.publicData.listingType !== PAGE_LISTING_TYPE) {
    return res;
  }

  const productsRes = await fetchAllPageProduct({ authorId: listing.author.id.uuid });
  if (productsRes.data.data.length > 0) {
    res.data.data.products = denormalisedResponseEntities(productsRes);
  }

  return res;
}

export default show;
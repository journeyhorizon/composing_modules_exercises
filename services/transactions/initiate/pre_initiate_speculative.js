import { PRODUCT_LISTING_TYPE } from '../../on_behalf_of/types';
import { denormalisedResponseEntities, sdk } from '../../sharetribe';
import createLineItem from '../custom_pricing';


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

  if (page >= totalPages) {
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

//This func is no-op right now
//It is created as an example on how we can process the users' params 
const handleParamsCreation = async ({ params }) => {
  return {
    ...params,
    protectedData: {
      ...params.protectedData
    }
  }
};

const execPreInitiateSpeculativeActions = async (fnParams) => {
  const { data, transactionId, simulate, ...rest } = fnParams;
  const { transition, processAlias, params } = data;
  const { listingId, authorId, negotiatedTotal } = params;

  const isNegotiationFlow = !!negotiatedTotal;

  const productsRes = isNegotiationFlow
    ? null
    : await fetchAllPageProduct({
      authorId: authorId.uuid
        ? authorId.uuid
        : authorId
    });

  const products = isNegotiationFlow
    ? null
    : denormalisedResponseEntities(productsRes);

  const [lineItems, createdParams] = await Promise.all([
    createLineItem({ listingId, params, products }),
    handleParamsCreation({ params })
  ]);
  //The result of this func would be the input of the initiate func
  return ({
    processAlias,
    transition,
    params: {
      ...createdParams,
      lineItems
    },
    ...rest
  })
}

export default execPreInitiateSpeculativeActions;
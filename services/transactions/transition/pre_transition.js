import createLineItem from '../custom_pricing';
import { getTransaction } from "../../sharetribe_admin";
import {
  TRANSITION_ACCEPT_OFFER_CARD_PAYMENT,
  TRANSITION_ACCEPT_OFFER_CASH_PAYMENT,
  TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY,
  TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
} from '../processes';
import { PRODUCT_LISTING_TYPE } from '../../on_behalf_of/types';
import { sdk } from '../../sharetribe';
import { fetchFormattedPageProducts } from '../../sharetribe/utils';

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
  const finalParams = {
    ...params,
    protectedData: {
      ...params.protectedData
    }
  };
  return finalParams;
};

const processTransitionParams = ({
  id,
  transition,
  params,
}) => {
  const requestToBookAfterEnquiryTransitions =
    [TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
      TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY,
      TRANSITION_ACCEPT_OFFER_CARD_PAYMENT,
      TRANSITION_ACCEPT_OFFER_CASH_PAYMENT];
  if (!requestToBookAfterEnquiryTransitions.includes(transition)) {
    return Promise.resolve(params);
  }
  const isNegotiationFlow = [
    TRANSITION_ACCEPT_OFFER_CARD_PAYMENT,
    TRANSITION_ACCEPT_OFFER_CASH_PAYMENT
  ].includes(transition);
  return getTransaction({
    transactionId: typeof id === 'string'
      ? id
      : id.uuid
    , include: ['listing', 'provider']
  })
    .then(async (tx) => {
      if (isNegotiationFlow) {
        return {};
      }
      const products = await fetchFormattedPageProducts({
        authorId: tx.provider.id.uuid
      });

      return { products };
    })
    .then(({ products }) =>
      Promise.all([
        createLineItem({ products, params }),
        handleParamsCreation({ params, })
      ]))
    .then(([lineItems, params]) => {
      return {
        ...params,
        lineItems
      }
    })
    .catch(e => {
      console.log(e);
      throw (e);
    })
}

const execPreTransitActions = async (fnParams) => {
  const {
    id,
    transition,
    params,
    clientTokenStore,
    clientQueryParams
  } = fnParams;

  const [processedParams] = await Promise.all([
    processTransitionParams({
      id,
      transition,
      params,
    }),
  ]);

  return {
    id,
    transition,
    params: processedParams,
    clientTokenStore,
    clientQueryParams
  };
}

export default execPreTransitActions;
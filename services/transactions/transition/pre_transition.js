import createLineItem from '../custom_pricing';
import { getTransaction } from "../../sharetribe_admin";
import {
  TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
} from '../processes';
import config from "../../config";


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
    [TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY];
  if (!requestToBookAfterEnquiryTransitions.includes(transition) ||
    !config.enableCustomCommission) {
    return Promise.resolve(params);
  }
  return getTransaction({
    transactionId: typeof id === 'string'
      ? id
      : id.uuid
    , include: ['listing']
  })
    .then(tx => {
      return tx.listing;
    })
    .then(listing =>
      Promise.all([
        createLineItem({ listing, params }),
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
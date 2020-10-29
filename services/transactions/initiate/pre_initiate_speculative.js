import { fetchFormattedPageProducts } from '../../sharetribe/utils';
import createLineItem from '../custom_pricing';

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

  const products = isNegotiationFlow
    ? null
    : await fetchFormattedPageProducts({
      authorId: authorId.uuid
        ? authorId.uuid
        : authorId
    });

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
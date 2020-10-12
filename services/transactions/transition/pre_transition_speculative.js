import createLineItem from '../custom_pricing';
import { types as sdkTypes } from '../../sharetribe';

const { UUID } = sdkTypes;

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

const execPreTransitionSpeculativeActions = async (fnParams) => {
  const { data, ...rest } = fnParams;
  const { id: txId, transition, params } = data;
  const { listingId } = params;

  const [lineItems, createdParams] = await Promise.all([
    createLineItem({ listingId, params }),
    handleParamsCreation({ params })
  ]);

  const processTxId = txId => {
    if (!txId) {
      throw (new Error(`Need transaction Id`));
    }

    if (txId instanceof UUID) {
      return txId;
    }

    if (txId.id) {
      return new UUID(txId.id);
    }

    return new UUID(txId);
  }

  const id = processTxId(txId);

  //The result of this func would be the input of the initiate func
  return ({
    id,
    transition,
    params: {
      ...createdParams,
      lineItems
    },
    ...rest
  })
}

export default execPreTransitionSpeculativeActions;
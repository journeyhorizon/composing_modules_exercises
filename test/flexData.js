import { types as sdkTypes } from '../services/sharetribe';

const { UUID, Money } = sdkTypes;
const DEFAULT_CURRENCY = 'USD';

export const createListing = ({ id, price, publicData, protectedData, metadata }) => {
  return {
    id: id
      ? new UUID(id)
      : new UUID('TEST-LISTING'),
    attributes: {
      price: price
        ? price
        : new Money(100, DEFAULT_CURRENCY),
      publicData: {
        ...publicData
      },
      protectedData: {
        ...protectedData
      },
      metadata: {
        ...metadata
      }
    }
  };
};


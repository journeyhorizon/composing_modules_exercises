import * as sharetribeAdmin from '../../services/sharetribe_admin';
import { createListing } from '../flexData';
import { types as sdkTypes } from '../../services/sharetribe';

const { Money } = sdkTypes;
const DEFAULT_CURRENCY = 'USD';

const setupFlexIntegrationMock = () => {
  jest.mock('../../services/sharetribe_admin.js');
  sharetribeAdmin.getListingData = jest.fn(async () => {
    return createListing({
      id: 'ID-TO-SEARCH',
      price: new Money(200, DEFAULT_CURRENCY)
    });
  });
};

export default setupFlexIntegrationMock;
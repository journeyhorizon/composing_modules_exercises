import setupFlexIntegrationMock from '../../../test/mock/integration';
import { LINE_ITEM_CUSTOMER_COMMISSION, LINE_ITEM_NIGHT, LINE_ITEM_PROVIDER_COMMISSION } from '../types';
import execPreInitiateActions from './pre_initiate';
import { types as sdkTypes } from '../../sharetribe';

const { Money } = sdkTypes;

setupFlexIntegrationMock();

const currency = 'USD';
const transition = "transitions/test-transit";
const processAlias = "test-process/release-1";
const listingId = "ID-TO-SEARCH";
const bookingStart = new Date(1601970612394);
const bookingEnd = new Date(1601970613977);
const clientQueryParams = {
  include: 'listing,provider,customer',
  expand: 'true'
};
const clientTokenStore = 'BEARER TOKEN';
const correctPrice = new Money(200, currency);

const fnParams = {
  data: {
    transition,
    processAlias,
    params: {
      listingId,
      bookingStart,
      bookingEnd,
    }
  },
  simulate: false,
  clientQueryParams,
  clientTokenStore
};

describe('pre-initiate phase', () => {
  it('should inject calculated line items to params, parsed in any intended others params and keep other things as is', () => {
    return execPreInitiateActions(fnParams)
      .then(data => {
        expect(data).toEqual({
          transition,
          processAlias,
          clientTokenStore,
          clientQueryParams,
          params: {
            listingId,
            bookingStart,
            bookingEnd,
            protectedData: {},
            lineItems: [
              {
                code: LINE_ITEM_NIGHT,
                unitPrice: correctPrice,
                quantity: 1,
                lineTotal: correctPrice,
                includeFor: ["customer", "provider"]
              },
              {
                code: LINE_ITEM_CUSTOMER_COMMISSION,
                unitPrice: correctPrice,
                percentage: 10,
                includeFor: ["customer"]
              },
              {
                code: LINE_ITEM_PROVIDER_COMMISSION,
                unitPrice: correctPrice,
                percentage: -10,
                includeFor: ["provider"]
              },
            ]
          },
          transition,
          processAlias
        })
      })
  })
});
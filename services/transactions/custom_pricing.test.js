import * as sharetribeAdmin from '../sharetribe_admin';
import * as sharetribeSdk from 'sharetribe-flex-sdk';
import setupFlexIntegrationMock from '../../test/mock/integration';
import { createListing } from '../../test/flexData';
import handleLineItemsCreation from './custom_pricing';
import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_NIGHT,
  LINE_ITEM_PROVIDER_COMMISSION
} from './types';

const { types: sdkTypes } = sharetribeSdk;
const { Money } = sdkTypes;
const CURRENCY = 'USD';

const listing = createListing({ price: new Money(100, CURRENCY) });
const { price } = listing.attributes;

setupFlexIntegrationMock();

describe('create line items for custom pricing', () => {
  it('should use passed in listing data and calculate based on it', () => {
    return handleLineItemsCreation({
      listing,
      params: {}
    })
      .then(lineItems => {
        expect(lineItems).toEqual([
          {
            code: LINE_ITEM_NIGHT,
            unitPrice: price,
            quantity: 1,
            lineTotal: price,
            includeFor: ["customer", "provider"]
          },
          {
            code: LINE_ITEM_CUSTOMER_COMMISSION,
            unitPrice: price,
            percentage: 10,
            includeFor: ["customer"]
          },
          {
            code: LINE_ITEM_PROVIDER_COMMISSION,
            unitPrice: price,
            percentage: -10,
            includeFor: ["provider"]
          },
        ]);
      });
  });

  it('should automatically fetch listing data if only listing id is provided and calculate based on it', () => {
    const correctPrice = new Money(200, CURRENCY);
    return handleLineItemsCreation({
      listingId: "ID-TO-SEARCH",
      params: {}
    })
      .then(lineItems => {
        expect(sharetribeAdmin.getListingData).toHaveBeenCalled();
        expect(sharetribeAdmin.getListingData).toHaveBeenCalledWith({
          listingId: "ID-TO-SEARCH"
        });
        expect(lineItems).toEqual([
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
        ]);
      });
  });
});

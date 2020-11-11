import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LINE_ITEM_UNITS,
  LINE_ITEM_DELIVERY,
} from "./types";

import { types as sdkTypes } from '../sharetribe';
const { Money } = sdkTypes;
const PREPAYMENT = 'prepayment';
const DELIVER_TO_SHIP = 'deliver_to_ship';

//Add business logic for calculating transaction here
const createLineItems = ({ listingId, params, products }) => {
  // const { bookingStart, bookingEnd, bookingDisplayStart, bookingDisplayEnd, protectedData = {} } = params;
  const {
    lineItems: clientLineItems,
    negotiatedTotal,
    protectedData,
  } = params;

  const {
    paymentMethod,
    deliveryCharge,
    deliveryMethod,
  } = protectedData || {};

  const isNegotiation = !!negotiatedTotal;
  if (isNegotiation) {
    return [
      {
        code: LINE_ITEM_UNITS,
        unitPrice: negotiatedTotal,
        quantity: 1,
        lineTotal: negotiatedTotal,
        includeFor: ["customer", "provider"]
      },
      {
        code: LINE_ITEM_PROVIDER_COMMISSION,
        unitPrice: negotiatedTotal,
        percentage: paymentMethod === PREPAYMENT ? -15 : -11,
        includeFor: ["provider"]
      },
    ];
  }

  const productDataObj = products.reduce((result, product) => {
    result[product.id.uuid] = product;
    return result;
  }, {});

  const serverLineItems = [];
  let totalPriceAmount = 0;

  for (const property in clientLineItems) {
    const lineItem = {
      quantity: clientLineItems[property],
      code: LINE_ITEM_UNITS,
      unitPrice: productDataObj[property].attributes.price,
      includeFor: ["customer", "provider"]
    }
    serverLineItems.push(lineItem);
    totalPriceAmount += productDataObj[property].attributes.price.amount * clientLineItems[property];
  }

  const firstIdProduct = Object.keys(clientLineItems)[0];
  const currency = productDataObj[firstIdProduct].attributes.price.currency;

  const deliveryLineItem = {
    code: LINE_ITEM_DELIVERY,
    unitPrice: deliveryCharge,
    quantity: 1,
    includeFor: ["customer", "provider"]
  };

  if (deliveryMethod === DELIVER_TO_SHIP && deliveryCharge && deliveryCharge.amount) {
    serverLineItems.push(deliveryLineItem);
    totalPriceAmount += deliveryCharge.amount;
  }

  const lineItems = [
    ...serverLineItems,
    {
      code: LINE_ITEM_PROVIDER_COMMISSION,
      unitPrice: new Money(totalPriceAmount, currency),
      percentage: paymentMethod === PREPAYMENT ? -15 : -11,
      includeFor: ["provider"],
    }
  ];

  return lineItems;
}

const handleLineItemsCreation = ({ params, products, listingId }) => {
  return createLineItems({ params, listingId, products });
};

export default handleLineItemsCreation

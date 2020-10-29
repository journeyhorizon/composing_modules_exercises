import {
  LINE_ITEM_CUSTOMER_COMMISSION,
  LINE_ITEM_PROVIDER_COMMISSION,
  LINE_ITEM_UNITS
} from "./types";

//Add business logic for calculating transaction here
const createLineItems = ({ listingId, params, products }) => {
  // const { bookingStart, bookingEnd, bookingDisplayStart, bookingDisplayEnd, protectedData = {} } = params;
  const {
    lineItems: clientLineItems,
    negotiatedTotal
  } = params;

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
        unitPrice: price,
        percentage: 15,
        includeFor: ["customer"]
      },
    ];
  }

  const productDataObj = products.reduce((result, product) => {
    result[product.id.uuid] = product;
    return result;
  }, {});

  const serverLineItems = clientLineItems.map(item => {
    const { productId, ...itemData } = item;
    return {
      ...itemData,
      code: LINE_ITEM_UNITS,
      unitPrice: productDataObj[productId].attributes.price,
      includeFor: ["customer", "provider"]
    }
  })

  const lineItems = [
    ...serverLineItems,
    {
      code: LINE_ITEM_CUSTOMER_COMMISSION,
      unitPrice: price,
      percentage: 10,
      includeFor: ["customer"]
    }
  ];

  return lineItems;
}

const handleLineItemsCreation = ({ params, products, listingId }) => {
  return createLineItems({ params, listingId, products });
};

export default handleLineItemsCreation

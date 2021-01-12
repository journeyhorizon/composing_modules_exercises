import { createFlexErrorObject, WRONG_PARAMS } from "../../../error";

const createNewItems = lineItems => lineItems.map(({
  priceData,
  quantity
}) => {
  if (!priceData) {
    throw ({
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: WRONG_PARAMS,
        messageCode: WRONG_PARAMS
      })
    });
  }
  const {
    listingId,
    price: {
      amount,
      currency
    },
    interval: {
      period,
      count
    },
  } = priceData;

  return {
    price_data: {
      product: listingId,
      unit_amount: amount,
      currency: currency,
      recurring: {
        interval: period,
        interval_count: count
      }
    },
    quantity
  }
});

const createUpdatedItems = ({
  lineItems,
  currentItems
}) => {
  const newItems = createNewItems(lineItems.filter(item => !!item.priceData));
  const desiredItems = lineItems.filter(item => !!item.pricingId).map(item => {
    const {
      pricingId,
      quantity
    } = item;
    return {
      price: pricingId,
      quantity
    }
  });
  const updatedItems = currentItems.map((currentItem) => {
    const {
      price,
      id
    } = currentItem;
    const existingItem = desiredItems.find(item => item.price === price.id);

    if (!existingItem) {
      return {
        id,
        deleted: true
      }
    }

    existingItem.inOldPlan = true;

    return {
      id,
      quantity: existingItem.quantity
    };
  });

  return [
    ...newItems,
    ...updatedItems,
    ...desiredItems.filter(item => !item.inOldPlan)
  ];
}


const createParams = ({
  subscription,
  lineItems,
  protectedData
}) => {
  const params = {
    cancel_at_period_end: false
  };

  if (lineItems) {
    params.items = createUpdatedItems({
      lineItems,
      currentItems: subscription.attributes.items,
    });
  }

  if (protectedData) {
    params.metadata = JSON.stringify({
      ...subscription.attributes.protectedData,
      ...protectedData
    });
  }

  return params;
}

export default createParams;
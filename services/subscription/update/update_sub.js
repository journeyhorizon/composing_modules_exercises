import { stripe } from "../../stripe";

const createUpdateItems = ({
  desiredItems,
  currentPlans
}) => {
  const currentItems = currentPlans.map(plan => {
    return {
      id: plan.id,
      price: plan.price.id,
      quantity: plan.quantity
    }
  });
  const updatedItems = currentItems.map(currentItem => {
    const newItemData = desiredItems.find(desiredItem =>
      desiredItem.price === currentItem.price);
    if (!newItemData) {
      return {
        ...currentItem,
        deleted: true
      };
    } else {
      newItemData.inOldPlan = true;
      return {
        ...currentItem,
        quantity: newItemData.quantity
      };
    }
  });

  desiredItems.forEach(desiredItem => {
    if (!desiredItem.inOldPlan) {
      updatedItems.push(desiredItem);
    }
  });

  return updatedItems;
}

const handleUpdateSubscription = async ({
  company,
  items: desiredItems,
  protectedData,
}) => {
  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = company;

  const items = createUpdateItems({
    desiredItems,
    currentPlans: subscription.plans
  });

  const params = {
    items,
    metadata: {
      protectedData: JSON.stringify(protectedData),
    }
  }

  return stripe.subscriptions.update(subscription.id, params)
    .then(subscription => {
      return {
        company,
        subscription
      }
    });
}

const updateSubscription = (fnParams) => async (company) => {
  const {
    params: {
      lineItems,
      protectedData
    }
  } = fnParams;

  const items = lineItems.map(({
    pricingId,
    quantity
  }) => {
    return {
      price: pricingId,
      quantity
    }
  });

  const params = {
    company,
    items,
    protectedData
  };

  return handleUpdateSubscription(params);
}

export default updateSubscription;
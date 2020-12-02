import { UNKNOWN_SUBSCRIPTION_PRICING_ERROR } from "../../error_type";
import { createFlexErrorObject } from "../../on_behalf_of/error";
import query from "../plan/query";
import { SUBSCRIPTION_TRIAL_STATE } from "../types";

const calculatePayinTotal = lineItems => {
  return lineItems.reduce((result, lineItem) => {
    return {
      currency: result.currency,
      amount: result.amount + lineItem.lineTotal.amount,
    }
  }, {
    amount: 0,
    currency: lineItems[0].lineTotal.currency
  })
}

const calculateTotalTierPrice = (quantity, tiers) => {
  return tiers.reduce((result, tier) => {
    const {
      unitAmount,
      upTo
    } = tier;

    const {
      total,
      previousUpTo
    } = result;

    if (quantity <= previousUpTo) {
      return total;
    }

    if (upTo) {
      if (quantity <= upTo) {
        const quantityToMultiply = quantity - previousUpTo;
        return {
          total: total + quantityToMultiply * unitAmount,
          previousUpTo: upTo
        };
      } else {
        const quantityToMultiply = upTo - previousUpTo;
        return {
          total: total + quantityToMultiply * unitAmount,
          previousUpTo: upTo
        };
      }
    } else {
      const quantityToMultiply = quantity - previousUpTo;
      return total + quantityToMultiply * unitAmount;
    }
  }, {
    total: 0,
    previousUpTo: 0
  });
}

const handleCreateNewSubscription = async ({
  company,
  items
}) => {
  const plans = await query();
  const pricing = plans.data.reduce((result, plan) => {
    return [...result, ...plan.pricing];
  }, []);
  const lineItems = items.map(item => {
    const itemDetail = pricing.find(pricing => pricing.id === item.price);
    if (!itemDetail) {
      throw ({
        code: 404,
        data: createFlexErrorObject({
          status: 404,
          message: UNKNOWN_SUBSCRIPTION_PRICING_ERROR,
          messageCode: UNKNOWN_SUBSCRIPTION_PRICING_ERROR
        })
      });
    }

    const { billingScheme, amount, currency, tiers } = itemDetail;
    if (billingScheme === 'per_unit') {
      return {
        lineTotal: {
          amount: amount * item.quantity,
          currency
        },
        unitPrice: {
          amount,
          currency
        },
        quantity: item.quantity,
        code: itemDetail.id
      };
    } else if (billingScheme === 'tiered') {
      return {
        lineTotal: {
          amount: calculateTotalTierPrice(item.quantity, tiers),
          currency
        },
        quantity: item.quantity,
        unitPrice: tiers.map(tier => {
          return {
            unitPrice: {
              amount: tier.unitAmount,
              currency
            },
            upTo: tiers.upTo
          }
        }),
        code: itemDetail.id
      };
    } else {
      throw ({
        code: 404,
        data: createFlexErrorObject({
          status: 404,
          message: UNKNOWN_SUBSCRIPTION_PRICING_ERROR,
          messageCode: UNKNOWN_SUBSCRIPTION_PRICING_ERROR
        })
      });
    }
  });
  return {
    data: {
      id: 'simulate-subscription',
      type: 'subscription',
      status: SUBSCRIPTION_TRIAL_STATE,
      attributes: {
        lineItems,
        payinTotal: calculatePayinTotal(lineItems)
      }
    }
  };
}

const initSpeculate = (fnParams) => async (company) => {
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

  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = company;

  const params = {
    company,
    items,
    protectedData
  };

  if (!subscription) {
    return handleCreateNewSubscription(params);
  } else {
    //TODO: Implement
    // return handleOverrideExistingSubscription(params);
  }
}

export default initSpeculate;
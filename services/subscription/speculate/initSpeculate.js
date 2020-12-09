import { UNKNOWN_SUBSCRIPTION_PRICING_ERROR } from "../../error_type";
import { createFlexErrorObject } from "../../on_behalf_of/error";
import query from "../plan/query";
import {
  SUBSCRIPTION_ACTIVE_STATE,
  SUBSCRIPTION_BOOKING_TYPE,
  SUBSCRIPTION_TRIAL_STATE,
  SUBSCRIPTION_TYPE
} from "../types";
import { types as sdkTypes } from '../../sharetribe';
import moment from "moment";
import config from "../../config";

const { Money, UUID } = sdkTypes;

const getCountryTaxList = () => {
  return stripe.taxRates.list({
    limit: LIMIT,
    active: true
  })
    .then(res => {
      return res.data;
    });
}

const calculatePayment = (lineItems, taxObject) => {
  const subtotal = lineItems.reduce((result, lineItem) => {
    return {
      currency: result.currency,
      amount: result.amount + lineItem.lineTotal.amount,
    }
  }, {
    amount: 0,
    currency: lineItems[0].lineTotal.currency
  });

  const taxPercent = taxObject
    ? taxObject.percentage
    : 0;

  const tax = {
    amount: subtotal.amount * taxPercent / 100,
    currency: subtotal.currency
  }

  const total = {
    amount: subtotal.amount + (subtotal.amount * taxPercent / 100),
    currency: subtotal.currency
  };

  return {
    tax,
    total,
    taxPercent,
    subtotal
  };
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

const handleEstimateSubscription = async ({
  company,
  items,
  disableTrial,
  countryCode,
}) => {
  const plans = await query();
  const pricing = plans.data.reduce((result, plan) => {
    return [...result, ...plan.pricing];
  }, []);

  let selectedPlanPricing = null;
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

    const { billingScheme, amount, currency: rawCurrency, tiers } = itemDetail;
    const currency = rawCurrency.toUpperCase();
    if (billingScheme === 'per_unit') {
      return {
        lineTotal: new Money(amount * item.quantity, currency),
        unitPrice: new Money(amount, currency),
        quantity: item.quantity,
        code: itemDetail.id
      };
    } else if (billingScheme === 'tiered') {
      selectedPlanPricing = itemDetail;
      return {
        lineTotal: new Money(calculateTotalTierPrice(item.quantity, tiers), currency),
        quantity: item.quantity,
        unitPrice: tiers.map(tier => {
          return {
            unitPrice: new Money(tier.unitAmount, currency),
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

  let taxObject = null;

  if (countryCode) {
    const taxesConfigs = await getCountryTaxList();
    taxObject = taxesConfigs.find(taxesConfig => {
      return taxesConfig.metadata.countryCode === countryCode;
    });
  }
  const {
    subtotal,
    tax,
    taxPercent,
    total
  } = calculatePayment(lineItems, taxObject);

  const returnedData = {
    data: {
      data: {
        id: new UUID('simulate-subscription'),
        type: SUBSCRIPTION_TYPE,
        status: disableTrial
          ? SUBSCRIPTION_ACTIVE_STATE
          : SUBSCRIPTION_TRIAL_STATE,
        attributes: {
          lineItems,
          number: 'simulate-subscription',
          payinTotal: new Money(total.amount, total.currency),
          payoutTotal: new Money(total.amount, total.currency),
          subtotal: new Money(subtotal.amount,  subtotal.currency),
          payDueTotal: new Money(total.amount,  total.currency),
          paidTotal: new Money(0,  total.currency),
          remainingTotal: new Money(total.amount,  total.currency),
          statusTransitions: [],
          tax: new Money(tax.amount, tax.currency),
          taxPercent
        },
        relationships: {
          booking: {
            data: {
              id: new UUID('estimate-booking-range'),
              type: SUBSCRIPTION_BOOKING_TYPE
            }
          }
        },
      },
      included: [
        {
          id: new UUID('estimate-booking-range'),
          type: SUBSCRIPTION_BOOKING_TYPE,
          start: moment().toDate(),
          bookingStart: moment().toDate(),
          end: disableTrial
            ? moment()
              .add(selectedPlanPricing.intervalCount, selectedPlanPricing.interval)
              .toDate()
            : moment()
              .add(config.subscription.trialPeriod, 'days')
              .toDate(),
          bookingEnd: disableTrial
            ? moment()
              .add(selectedPlanPricing.intervalCount, selectedPlanPricing.interval)
              .toDate()
            : moment()
              .add(config.subscription.trialPeriod, 'days')
              .toDate()
        }
      ]
    }
  }

  return returnedData;
}

const initSpeculate = (fnParams) => async (company) => {
  const {
    params: {
      lineItems,
      protectedData,
      countryCode: clientCountryCode
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
        },
        protectedData: {
          countryCode: companyCountryCode
        }
      }
    }
  } = company;

  const countryCode = companyCountryCode || clientCountryCode;

  const params = {
    company,
    items,
    protectedData,
    countryCode,
  };

  if (subscription) {
    params.disableTrial = true;
  }

  return handleEstimateSubscription(params);
}

export default initSpeculate;
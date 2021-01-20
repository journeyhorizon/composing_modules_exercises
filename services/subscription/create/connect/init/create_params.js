import { createFlexErrorObject, WRONG_PARAMS } from "../../../../error";

const createItems = lineItems => lineItems.map(({
  pricingId,
  priceData,
  quantity
}) => {
  if (pricingId) {
    return {
      price: pricingId,
      quantity
    }
  }

  if (priceData) {
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
  }

  throw ({
    code: 400,
    data: createFlexErrorObject({
      status: 400,
      message: WRONG_PARAMS,
      messageCode: WRONG_PARAMS
    })
  });
});

const createSubscriptionParams = async ({
  fnParams,
  customer,
  provider
}) => {
  const {
    params: {
      lineItems,
      protectedData,
      bookingStartTime,
      bookingEndTime,
      commissionPercentage,
    }
  } = fnParams;

  const items = createItems(lineItems);

  const params = {
    customer: customer.stripeCustomer.id,
    items,
    transfer_data: {
      destination: provider.stripeAccount.attributes.stripeAccountId,
    },
    metadata: {
      protectedData: protectedData ? JSON.stringify(protectedData) : {},
      'sharetribe-user-id': customer.id.uuid,
      'sharetribe-provider-id': provider.id.uuid,
      'stripe-destination': provider.stripeAccount.attributes.stripeAccountId,
      'stripe-customer': customer.stripeCustomer.id,
    },
    // on_behalf_of: provider.stripeAccount.attributes.stripeAccountId
  };

  if (bookingStartTime) {
    params.trial_end = bookingStartTime;
  }
  if (bookingEndTime) {
    params.cancel_at = bookingEndTime;
  }
  if (commissionPercentage) {
    /**
     * Because subscription is hard to calculate pro-rated amount
     * Stripe can't create subscription with flat-fee
     * You want to take flat-fee, you must set it separately by invoice
     * Create a webhook to receive when an invoice is called and set the @application_fee_amount
     * Further guide: https://stripe.com/docs/connect/subscriptions#subscription-invoices
     */
    params.application_fee_percent = commissionPercentage;
  }

  return params;
}

export default createSubscriptionParams;
import { stripe } from "../../..";

const createSeparateCharge = invoice => async ({ subscription, params, customerPaymentMethod }) => {
  return stripe.paymentIntents.create({
    ...params,
    customer: invoice.customer,
    description: `For workaround on the current invoice ${invoice.id} because the provider is in different region`,
    metadata: {
      subscriptionId: subscription.id
    },
    amount: invoice.amount_due,
    currency: invoice.currency,
    payment_method: customerPaymentMethod,
    off_session: true,
    confirm: true,
  });
}

export default createSeparateCharge;
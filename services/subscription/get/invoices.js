import { stripe } from "../../stripe";
import normaliser from "../normaliser";

const LIMIT = 24;

const fetchInvoiceHistory = async (subscription) => {
  const invoicesRes = await stripe.invoices.list({
    // subscription: subscription.data.id.uuid,
    customer: subscription.data.relationships.stripeCustomer.data.id.uuid,
    limit: LIMIT,
  });

  subscription.data.relationships = {
    ...subscription.data.relationships,
    invoices: {
      data: []
    }
  };

  invoicesRes.data.forEach(invoice => {
    const normalisedInvoice = normaliser.invoice({ data: invoice });
    const {
      data,
      included
    } = normalisedInvoice;

    const {
      id,
      type,
      relationships
    } = data;

    subscription.included = [
      ...subscription.included,
      ...included,
      data
    ];

    subscription.data.relationships.invoices.data.push({
      id,
      type,
      relationships
    })
  });

  return subscription;
}

export default fetchInvoiceHistory;
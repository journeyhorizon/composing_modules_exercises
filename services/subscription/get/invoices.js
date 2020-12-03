import { pick } from "lodash";
import { stripe } from "../../stripe";
import {
  SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE, SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE
} from '../attributes';
import normaliser from "../normaliser";

const LIMIT = 24;

const fetchInvoiceHistory = async (subscription) => {
  const invoicesRes = await stripe.invoices.list({
    subscription: subscription.data.id.uuid,
    limit: LIMIT,
  });

  subscription.data.relationships = {
    ...subscription.data.relationships,
    invoices: []
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

    subscription.data.relationships.invoices.push({
      data: {
        id,
        type,
        relationships
      }
    })
  });


  return subscription;
}

export default fetchInvoiceHistory;
import { pick } from "lodash";
import { stripe } from "../../stripe";
import {
  SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE, SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE
} from '../attributes';

const LIMIT = 24;

const fetchInvoiceHistory = async (subscription) => {
  const invoicesRes = await stripe.invoices.list({
    subscription: subscription.id,
    limit: LIMIT,
  });
  const invoices = invoicesRes.data.map(invoice => {
    const normalisedInvoice = pick(invoice, SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE);
    return {
      ...normalisedInvoice,
      lines: invoice.lines.data.map(line => pick(line, SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE))
    }
  });

  subscription.invoices = invoices;

  return subscription;
}

export default fetchInvoiceHistory;
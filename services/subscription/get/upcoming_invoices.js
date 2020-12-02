import { pick } from "lodash";
import { stripe } from "../../stripe";
import {
  SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE, SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE
} from '../attributes';

const fetchUpcomingInvoice = async (subscription) => {
  const upcomingInvoiceRes = await stripe.invoices.retrieveUpcoming({
    customer: subscription.stripeCustomer.id,
  });

  const upcomingInvoice = {
    ...pick(upcomingInvoiceRes, SUBSCRIPTION_HISTORY_TO_TAKE_FROM_STRIPE),
    lines: upcomingInvoiceRes.lines.data.map(line => pick(line, SUBSCRIPTION_LINE_ITEM_TO_TAKE_FROM_STRIPE))
  };

  subscription.upcomingInvoice = upcomingInvoice;

  return subscription;
}

export default fetchUpcomingInvoice;
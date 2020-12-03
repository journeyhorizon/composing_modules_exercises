import { stripe } from "../../stripe";
import normaliser from "../normaliser";

const fetchUpcomingInvoice = async (subscription) => {
  const upcomingInvoiceRes = await stripe.invoices.retrieveUpcoming({
    customer: subscription.data.relationships.stripeCustomer.data.id.uuid,
  });

  upcomingInvoiceRes.id = 'upcoming-invoice';

  const normalisedInvoice = normaliser.invoice({ data: upcomingInvoiceRes });
  const {
    data,
    included
  } = normalisedInvoice;

  subscription.included = [
    ...subscription.included,
    ...included,
    data
  ];

  const {
    id,
    type,
    relationships
  } = data;

  subscription.data.relationships.upcomingInvoices = {
    data: {
      id,
      type
    },
    relationships
  };

  return subscription;
}

export default fetchUpcomingInvoice;
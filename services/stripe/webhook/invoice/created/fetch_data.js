import { stripe } from "../../..";
import { convertObjToCamelCase } from "../../../../utils";

const fetchInvoice = id => stripe.invoices.retrieve(id)
  .then(res => convertObjToCamelCase(res));

const fetchSubscription = (id) => stripe.subscriptions.retrieve(id)
  .then(res => convertObjToCamelCase(res));

const fetchData = async (rawInvoice) => {
  const [invoice, subscription] = await Promise.all([
    fetchInvoice(rawInvoice.id),
    fetchSubscription(rawInvoice.subscription)
  ]);

  return {
    invoice,
    subscription
  };
}

export default fetchData;
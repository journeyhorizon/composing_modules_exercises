import { stripe } from "../../..";
import { convertObjToCamelCase } from "../../../../utils";

const fetchInvoice = id => stripe.invoices.retrieve(id)
  .then(res => convertObjToCamelCase(res));

const fetchSubscription = (id) => stripe.subscriptions.retrieve(id)
  .then(res => convertObjToCamelCase(res));

const fetchData = async (rawInvoice) => {
  const [invoice, subscription, customerPaymentMethodList] = await Promise.all([
    fetchInvoice(rawInvoice.id),
    fetchSubscription(rawInvoice.subscription),
    stripe.customers.listPaymentMethods(
      rawInvoice.customer,
      { type: 'card' }
    )
  ]);

  return {
    invoice,
    subscription,
    customerPaymentMethod: customerPaymentMethodList.data[0]?.id
  };
}

export default fetchData;
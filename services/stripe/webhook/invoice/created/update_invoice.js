import { stripe } from "../../..";

const updateInvoice = id => async (params) => {
  return stripe.invoices.update(id, params);
}

export default updateInvoice;
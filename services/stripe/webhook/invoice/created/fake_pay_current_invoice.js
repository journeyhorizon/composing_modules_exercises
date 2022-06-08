import { stripe } from "../../..";

const fakePayCurrentInvoice = id => async ({ params }) => {
  await stripe.invoices.update(
    id,
    { auto_advance: false }
  );

  await stripe.invoices.finalizeInvoice(
    id,
    { auto_advance: false }
  );

  return stripe.invoices.pay(
    id,
    {
      paid_out_of_band: true
    })
    .then(() => params);
}

export default fakePayCurrentInvoice;
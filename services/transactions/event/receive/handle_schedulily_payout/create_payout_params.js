import { stripe } from "../../../../stripe";

const createPayoutParams = async (customerSubscriptions) => {
  const customerPayouts = {};
  for (const customer in customerSubscriptions) {
    const { default_source, currency } = await stripe.customers.retrieve(customer);
    const totalPayoutAmount = customerSubscriptions[customer].reduce((total, items) => {
      return total + items.price.unit_amount;
    }, 0);
    customerPayouts[customer] = { destination: default_source, amount: totalPayoutAmount, currency };
  }

  return customerPayouts;
}

export default createPayoutParams;
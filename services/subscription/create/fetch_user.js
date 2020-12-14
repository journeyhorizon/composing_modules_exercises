import { getUserData } from "../../sharetribe_admin";
import { stripe } from "../../stripe";

const fetchCustomer = async (userId) => {
  return Promise.all([
    getUserData({ userId, include: ['stripeAccount'] }),
    stripe.jh.customer.find(userId)
  ]).then(([customer, stripeCustomer]) => {
    customer.stripeCustomer = stripeCustomer;
    return customer;
  })
}

export default fetchCustomer;

import { stripe } from "../../stripe";

const createStripeProduct = async (params) => {
  return stripe.products.create(params);
}

export default createStripeProduct;
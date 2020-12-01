import Stripe from "stripe";
import config from '../config';
import customer from "./customer";


const stripe = new Stripe(config.stripe.secret, {
  apiVersion: config.stripe.apiVersion,
  maxNetworkRetries: config.retries
});

stripe.jh = {
  customer
}

export { stripe };

import Stripe from "stripe";
import config from '../config';
import customer from "./customer";
import webhook from "./webhook";


const stripe = new Stripe(config.stripe.secret, {
  apiVersion: config.stripe.apiVersion,
  maxNetworkRetries: config.retries
});

stripe.jh = {
  customer,
  webhook
}

export { stripe };

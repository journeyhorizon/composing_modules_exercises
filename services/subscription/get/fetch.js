import { pick } from "lodash";
import { stripe } from "../../stripe";
import { DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE } from '../attributes';

const fetchStripeSubscription = async ({ id }) => {
  const subscription = await stripe.subscriptions.retrieve(
    id
  );
  return pick(subscription, DETAILS_SUBSCRIPTION_ATTRIBUTES_TO_TAKE_FROM_STRIPE)
}

export default fetchStripeSubscription;
import { stripe } from "../../stripe";
import normaliser from "../normaliser";


const fetchStripeSubscription = async ({ id }) => {
  const subscription = await stripe.subscriptions.retrieve(
    id
  );
  return normaliser.subscriptionDetails({
    data: subscription,
  });
}

export default fetchStripeSubscription;
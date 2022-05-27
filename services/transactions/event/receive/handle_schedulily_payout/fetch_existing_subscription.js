import { stripe } from "../../../../stripe";

const DAYS = 3 * (24 * 60 * 60 * 1000);

const fetchExistingSubscription = async (defaultParams) => {
  let hasMore = true;
  const queryParams = {
    created: {
      lte: Date.now() - DAYS
    },
    limit: 100,
    starting_after: null
  }
  const providerSubscriptions = {};
  
  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list(queryParams);

    if (subscriptions.data?.length === 0) {
      break;
    }

    subscriptions.data.forEach((subscription) => {
      const { metadata, items: subscriptionItems, id, ...rest } = subscription;
      const providerId = metadata['sharetribe-provider-id'];
      const providerStripeAccId = metadata['stripe-destination'];

      if (subscriptionItems.data?.length > 0) {
        const existingSubscriptions = providerSubscriptions[providerId].subscriptions || [];
        providerSubscriptions[providerId].subscriptions = existingSubscriptions.concat(subscriptionItems.data);
        providerSubscriptions[providerId].stripeAccountId = providerStripeAccId;
      }
    })
    hasMore = response.has_more;
    queryParams.starting_after = hasMore && id;
  }

  return providerSubscriptions;
}

export default fetchExistingSubscription;
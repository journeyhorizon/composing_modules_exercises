import { stripe } from "../../../../stripe";

const DAYS = 3 * (24 * 60 * 60); // Seconds

const fetchExistingSubscription = async (currentDate) => {
  let hasMore = true;
  const currentDate = Math.round(Date.now() / 1000);
  const lastDate = new Date(currentDate);
  
  if (currentDate.getDate() === 1) {
    lastDate.setMonth(lastDate.getMonth() - 1);
    lastDate.setDate(15);
  }
  else {
    lastDate.setDate(1);
  }
  const queryParams = {
    created: {
      lte: currentDate - DAYS
    },
    limit: 100,
    starting_after: null,
    current_period_start: {
      lt: currentDate,
      gte: Math.round(lastDate.now() / 1000)
    }
  }
  const providerSubscriptions = {};
  
  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list(queryParams);

    if (subscriptions.data?.length === 0) {
      break;
    }

    subscriptions.data.forEach((subscription) => {
      const { metadata, items: subscriptionItems, id } = subscription;
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
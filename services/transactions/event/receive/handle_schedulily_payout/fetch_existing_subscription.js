import { stripe } from "../../../../stripe";

const DAYS = 3 * (24 * 60 * 60); // Seconds

const fetchExistingSubscription = async () => {
  let hasMore = true;
  const currentDate = Date.now();
  const currentDateTimestamp = Math.round(currentDate / 1000);
  const lastDate = new Date(currentDate);
  
  if (currentDate.getDate() === 1) {
    lastDate.setMonth(lastDate.getMonth() - 1);
    lastDate.setDate(15);
  }
  else {
    lastDate.setDate(1);
  }
  const lastDateTimestamp = Math.round(lastDate.getTime() / 1000);
  const queryParams = {
    created: {
      lte: currentDate - DAYS
    },
    limit: 100,
    starting_after: null,
    current_period_start: {
      lt: currentDateTimestamp,
      gte: lastDateTimestamp
    }
  }
  const providerSubscriptions = {};
  
  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list(queryParams);
    
    const { data: subscriptionDetails = [], has_more: hasMore } = subscriptions;

    if (subscriptionDetails.length === 0) {
      break;
    }

    subscriptionDetails.forEach((subscription) => {
      const { metadata } = subscription;
      const providerId = metadata['sharetribe-provider-id'];
      const providerStripeAccId = metadata['stripe-destination'];

      const currentSubscriptions = providerSubscriptions[providerId].subscriptions || [];
      providerSubscriptions[providerId].subscriptions = currentSubscriptions.concat(subscription);
      providerSubscriptions[providerId].stripeAccountId = providerStripeAccId;
    })

    if (hasMore) {
      const lastObjectId = subscriptionDetails.slice(-1)[0].id;
      queryParams.starting_after = lastObjectId;
    }
  }

  return providerSubscriptions;
}

export default fetchExistingSubscription;
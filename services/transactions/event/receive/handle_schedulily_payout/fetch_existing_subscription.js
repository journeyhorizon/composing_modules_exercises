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
  const customerSubscriptions = {};
  
  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list(queryParams);

    if (subscriptions.data?.length === 0) {
      break;
    }

    subscriptions.data.forEach((subscription) => {
      const { customer, items: subscriptionItems, id, ...rest } = subscription;
      if (subscriptionItems.data?.length > 0) {
        const existingSubscriptions = customerSubscriptions[customer] || [];
        customerSubscriptions[customer] = existingSubscriptions.concat(subscriptionItems.data);
      }
    })
    hasMore = response.has_more;
    queryParams.starting_after = hasMore && id;
  }

  return customerSubscriptions;
}

export default fetchExistingSubscription;
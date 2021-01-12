import normaliser from "../normaliser";

const normaliseSubscriptionData = async (subscription) => {
  return normaliser.subscriptionDetails({ data: subscription });
}

export default normaliseSubscriptionData;
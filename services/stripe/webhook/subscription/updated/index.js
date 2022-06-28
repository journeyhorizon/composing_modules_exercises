import { getUserData } from "../../../../sharetribe_admin";
import { convertObjToCamelCase } from "../../../../utils";
import { processNewPeriod } from "./processNewPeriod";

const handleUpdateEvent = async ({
  subscription: subscriptionInUnderscore,
  previousAttributes: previousAttributesInUnderscore
}) => {
  const subscription = convertObjToCamelCase(subscriptionInUnderscore);
  const previousAttributes = previousAttributesInUnderscore ? convertObjToCamelCase(previousAttributesInUnderscore) : {};
  const { currentPeriodEnd: prevPeriodEnd, currentPeriodStart: prevPeriodStart } = previousAttributes;
  const {
    metadata,
    currentPeriodEnd,
    currentPeriodStart,
    status
  } = subscription;
  const providerId = metadata.sharetribeProviderId;
  const customerId = metadata.sharetribeUserId;
  const txId = metadata.sharetribeTransactionId

  if (!providerId || !customerId) {
    console.error(new Error(`Can not find sharetribe provider id or customer id for subscription ${subscription.id}`));
    return {
      code: 200,
      data: 'received'
    };
  }

  if (!txId) {
    console.error(new Error(`Can not find txId id for subscription ${subscription.id}`));
    return {
      code: 200,
      data: 'received'
    };
  }

  // Check whether the subscription is renewal to send notifications via email
  if (prevPeriodEnd && prevPeriodStart
    && prevPeriodEnd !== currentPeriodEnd 
    && prevPeriodEnd === currentPeriodStart
    && status === 'active'
  ) {
    const [provider, customer] = await Promise.all([
      getUserData({ userId: providerId }), 
      getUserData({ userId: customerId })
    ]);
    const { attributes: { email: providerEmail, profile: { displayName: providerDisplayName } } } = provider || {};
    const { attributes: { email: customerEmail, profile: { displayName: customerDisplayName } } } = customer || {};
    const params = {
      providerEmail,
      providerName: providerDisplayName,
      customerEmail,
      customerName: customerDisplayName,
      transactionId: txId
    }
    await processNewPeriod(params);
  }

  return {
    code: 200,
    data: 'received'
  };
}

export default handleUpdateEvent;
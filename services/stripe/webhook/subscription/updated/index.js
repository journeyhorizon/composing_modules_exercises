import { convertObjToCamelCase } from "../../../../utils";
import { processNewPeriod } from "./processNewPeriod";
import { EVENT_TYPE_NEW_PERIOD } from './types';

const getUpdateEventType = (subscription, previousAttributes) => {
  const { currentPeriodEnd: prevPeriodEnd, currentPeriodStart: prevPeriodStart } = previousAttributes;
  const { currentPeriodEnd, currentPeriodStart, status } = subscription;
  if (
    prevPeriodEnd && 
    prevPeriodStart && 
    prevPeriodEnd !== currentPeriodEnd && 
    prevPeriodEnd === currentPeriodStart && 
    status === 'active'
  ) {
    return EVENT_TYPE_NEW_PERIOD;
  }
  return null;
}

const handleUpdateEvent = async ({
  subscription: subscriptionInUnderscore,
  previousAttributes: previousAttributesInUnderscore
}) => {
  const subscription = convertObjToCamelCase(subscriptionInUnderscore);
  const previousAttributes = previousAttributesInUnderscore ? convertObjToCamelCase(previousAttributesInUnderscore) : {};
  const { sharetribeTransactionId: txId } = subscription.metadata;

  if (!txId) {
    return {
      code: 404,
      data: {
        error: `Can not find txId id for subscription ${subscription.id}`
      }
    };
  }

  const eventType = getUpdateEventType(subscription, previousAttributes);

  switch(eventType) {
    case EVENT_TYPE_NEW_PERIOD: {
      await processNewPeriod({ transactionId: txId });
      break;
    }
  }

  return {
    code: 200,
    data: 'received'
  };
}

export default handleUpdateEvent;
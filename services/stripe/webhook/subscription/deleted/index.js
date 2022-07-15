import { getUserData, integrationSdk } from "../../../../sharetribe_admin";
import { TRANSITION_COMPLETE_SUBSCRIPTION } from "../../../../transactions/util";
import { convertObjToCamelCase } from "../../../../utils";

const handleDeleteEvent = async ({
  subscription: subscriptionInUnderscore
}) => {

  const subscription = convertObjToCamelCase(subscriptionInUnderscore);

  const {
    metadata,
  } = subscription;
  const userId = metadata.sharetribeUserId;
  const txId = metadata.sharetribeTransactionId

  if (!userId) {
    console.error(new Error(`Can not find sharetribe user id for subscription ${subscription.id}`));
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

  await integrationSdk.transactions.transition({
    id: txId,
    transition: TRANSITION_COMPLETE_SUBSCRIPTION,
    params: {}
  });

  //TODO: Put logic for handling subscription deletion callback here

  return {
    code: 200,
    data: 'received'
  };
}

export default handleDeleteEvent;
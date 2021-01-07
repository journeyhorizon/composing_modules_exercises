import { getUserData } from "../../../../sharetribe_admin";
import { convertObjToCamelCase } from "../../../../utils";

const handleUpdateEvent = async ({
  subscription: subscriptionInUnderscore
}) => {

  const subscription = convertObjToCamelCase(subscriptionInUnderscore);

  const {
    metadata,
  } = subscription;
  const userId = metadata.sharetribeUserId;

  if (!userId) {
    console.error(new Error(`Can not find sharetribe user id for subscription ${subscription.id}`));
    return {
      code: 200,
      data: 'received'
    };
  }

  const currentUser = await getUserData({ userId });

  //TODO: Put logic for handling subscription logic hook here

  return {
    code: 200,
    data: 'received'
  };
}

export default handleUpdateEvent;
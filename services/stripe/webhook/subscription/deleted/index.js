import { getUserData } from "../../../../sharetribe_admin";
import { convertObjToCamelCase } from "../../../../utils";
import updateFlexProfile from "./update_profile";
import closeAllPortsListing from "./handle_port";

const handleDeleteEvent = async ({
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

  //TODO: Put logic for handling subscription deletion callback here
  
  return {
    code: 200,
    data: 'received'
  };
}

export default handleDeleteEvent;
import { getUserData } from "../../../../sharetribe_admin";
import { convertObjToCamelCase } from "../../../../utils";
import openExistingPortsListing from "./handle_port";
import updateFlexProfile from "./update_profile";

const handleCreateEvent = async ({
  subscription: subscriptionInUnderscore
}) => {

  const subscription = convertObjToCamelCase(subscriptionInUnderscore);

  const {
    metadata,
  } = subscription;
  const companyId = metadata.sharetribeUserId;

  if (!companyId) {
    console.error(new Error(`Can not find sharetribe user id for subscription ${subscription.id}`));
    return {
      code: 200,
      data: 'received'
    };
  }

  const company = await getUserData({ userId: companyId });

  const {
    attributes: {
      profile: {
        metadata: {
          subscription: subscriptionMetadata
        }
      }
    }
  } = company;

  if (!subscriptionMetadata || !subscriptionMetadata.pastSubscriptionIds) {
    return {
      code: 200,
      data: 'received'
    };
  }

  const { activePorts } = await openExistingPortsListing({
    company,
    subscription: subscriptionInUnderscore
  });

  await updateFlexProfile({
    company,
    subscription: subscriptionInUnderscore,
    activePorts
  });

  return {
    code: 200,
    data: 'received'
  };
}

export default handleCreateEvent;
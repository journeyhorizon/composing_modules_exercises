import { getUserData } from "../../../../sharetribe_admin";
import { convertObjToCamelCase } from "../../../../utils";
import updateFlexProfile from "./update_profile";

const handleUpdateEvent = async ({
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

  await updateFlexProfile({
    company,
    subscription: subscriptionInUnderscore
  });

  return {
    code: 200,
    data: 'received'
  };
}

export default handleUpdateEvent;
import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import subscriptionSdk from "../../../subscription";

const initiate = async ({
  data,
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];
  return subscriptionSdk.create({
    customerId: currentUser.id.uuid,
    params: data.params
  })
}

export default initiate;
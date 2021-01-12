import { denormalisedResponseEntities, sdk } from "../../../sharetribe";
import subscriptionSdk from "../../../subscription";

const initiate = async ({
  data,
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  const params = {
    customerId: currentUser.id.uuid,
    params: data.params
  };

  if (data.params.providerId) {
    params.providerId = data.params.providerId;
    delete data.params.providerId;
  }

  return subscriptionSdk.create(params);
}

export default initiate;
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
    //Since in some marketplace the author and the actual provider could be different so we split them out
    //We can change the logic here to fetch the listing's author instead of asking client's input
    params.providerId = typeof data.params.providerId === 'string'
      ? data.params.providerId
      : data.params.providerId.uuid;
    delete data.params.providerId;
  }

  return subscriptionSdk.create(params);
}

export default initiate;
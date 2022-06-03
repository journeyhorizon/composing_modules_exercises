import { denormalisedResponseEntities, sdk } from "../../../../sharetribe";
import createInternalSubscriptionParams from "./create_internal_subscription_params";

const createRawInputParams = async ({
  params,
  id,
  clientTokenStore
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentTxRes = await trustedSdk.transactions
    .show(
      {
        id,
        include: [
          'customer',
          'provider',
          'listing',
          'booking',
        ],
      },
    )
  const currentTx = denormalisedResponseEntities(currentTxRes)[0];

  const rawInputParams = {
    listingId: currentTx.listing.id.uuid,
    customerId: currentTx.customer.id.uuid,
    providerId: currentTx.provider.id.uuid,
    transactionId: currentTx.id.uuid,
    params: createInternalSubscriptionParams({ params, transaction: currentTx }),
  };

  return {
    params: rawInputParams,
    trustedSdk
  };
}

export default createRawInputParams;
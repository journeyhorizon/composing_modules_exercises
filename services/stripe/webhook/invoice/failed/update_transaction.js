import { integrationSdk } from "../../../../sharetribe_admin";

const updateTransaction = subscription => {
  const {
    metadata: {
      sharetribeTransactionId
    } = {}
  } = subscription;

  return integrationSdk.transactions.updateMetadata({
    id: sharetribeTransactionId,
    metadata: {
      paymentMethodNeedUpdate: true
    }
  });
}

export default updateTransaction;
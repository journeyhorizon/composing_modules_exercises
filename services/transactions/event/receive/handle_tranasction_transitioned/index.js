import { TRANSACTION_TYPE_IS_NOT_SUBSCRIPTION } from "../../../../error";
import subscriptionSdk from "../../../../subscription";
import { txIsCanceled, txIsSubscription } from "../../../util";

const handleTransactionTransitioned = async (tx) => {
  if (!txIsSubscription(tx)) {
    throw ({
      code: 400,
      message: TRANSACTION_TYPE_IS_NOT_SUBSCRIPTION
    })
  }

  if (txIsCanceled(tx)) {
    await subscriptionSdk.cancel({
      id: tx.attributes.protectedData.subscriptionId,
    })
  }

  return {
    code: 200,
    message: 'received'
  };
}

export default handleTransactionTransitioned;
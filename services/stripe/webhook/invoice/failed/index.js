import fetchSubscription from "./fetch_data";
import updateTransaction from "./update_transaction";
import finalise from "../../../../common/finalise";
import { composePromises } from "../../../../utils";
import checkInvoice from "./check_invoice";

const handleFailedEvent = async ({ invoice }) => {
  return composePromises(
    checkInvoice,
    fetchSubscription,
    updateTransaction,
    finalise
  )(invoice);
}

export default handleFailedEvent;

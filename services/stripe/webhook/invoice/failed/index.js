import fetchSubscription from "./fetch_data";
import updateTransaction from "./update_transaction";
import finalise from "../../../../common/finalise";
import { composePromises } from "../../../../utils";

const handleFailedEvent = async ({ invoice }) => {
  return composePromises(
    fetchSubscription,
    updateTransaction,
    finalise
  )(invoice.subscription);
}

export default handleFailedEvent;

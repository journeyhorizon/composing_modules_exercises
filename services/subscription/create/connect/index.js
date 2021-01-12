import { composePromises } from "../../../utils";
import finalise from "../../common_functions/finalise";
import normaliseSubscriptionData from "../../common_functions/normalise_subscription_data";
import fetchUpcomingInvoice from "../../common_functions/fetch_upcoming_invoice";
import fetchUsersData from "./fetch_users";
import checkRequirement from "./verify";
import init from "./init";


const handleCreateSubscriptionForConnect = async (fnParams) => {
  const { customerId, providerId } = fnParams;

  return composePromises(
    fetchUsersData,
    checkRequirement,
    init(fnParams),
    normaliseSubscriptionData,
    fetchUpcomingInvoice,
    finalise
  )({
    customerId,
    providerId
  })
}

export default handleCreateSubscriptionForConnect;
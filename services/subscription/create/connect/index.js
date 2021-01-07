import { composePromises } from "../../../utils";
import finalise from "../finalise";
import normaliseSubscriptionData from "../normalise";
import fetchUpcomingInvoice from "../upcoming_invoice";
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
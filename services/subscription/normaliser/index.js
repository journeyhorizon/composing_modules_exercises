import normaliseInvoice from "./invoice";
import normaliseSubscription from "./subscription";

const normaliser = {
  invoice: normaliseInvoice,
  subscriptionDetails: normaliseSubscription,
};

export default normaliser;
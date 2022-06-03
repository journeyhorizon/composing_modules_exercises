import { stripe } from "../../..";
import { convertObjToCamelCase } from "../../../../utils";

const fetchSubscription = (id) => stripe.subscriptions.retrieve(id)
  .then(res => convertObjToCamelCase(res));

export default fetchSubscription;
import { stripe } from "../../../stripe";
import pick from "lodash/pick";
import {
  SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
} from "../attributes";
import { convertObjToCamelCase } from "../../../utils";

const QUERY_LIMIT = 100;

const fetchStripePlanAssociatedWithProduct = async ({ id }) => {
  const stripePlansRes = await stripe.plans.list({
    limit: QUERY_LIMIT,
    product: id,
    active: true
  });
  const stripePlans = stripePlansRes.data;
  const planForClient = stripePlans.map(currentPlan => {
    const pickedPricing = pick(currentPlan, SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE);
    return convertObjToCamelCase(pickedPricing);
  });

  return {
    id,
    pricing: planForClient,
    attributes: {}
  };
}

export default fetchStripePlanAssociatedWithProduct;
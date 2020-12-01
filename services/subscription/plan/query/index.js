import { stripe } from "../../../stripe";
import pick from "lodash/pick";
import {
  SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE,
  SUBSCRIPTION_PLAN_ATTRIBUTES_TO_TAKE_FROM_STRIPE
} from "../attributes";
import { convertObjToCamelCase } from "../../../utils";

const QUERY_LIMIT = 100;

const query = async () => {
  const stripePlansRes = await stripe.plans.list({ limit: QUERY_LIMIT });
  const stripePlans = stripePlansRes.data;

  const aggregatedPlan = stripePlans.reduce((aggregatedPlan, currentPlan) => {
    const { product: productId } = currentPlan;
    const pricingObj =
      pick(currentPlan, SUBSCRIPTION_PRICING_ATTRIBUTES_TO_TAKE_FROM_STRIPE);
    if (aggregatedPlan[productId]) {
      aggregatedPlan[productId].pricing.push(pricingObj);
    } else {
      aggregatedPlan[productId] = {
        pricing: [pricingObj]
      };
    }
    return aggregatedPlan;
  }, {});

  const stripeSubscriptionProductsRes = await stripe.products.list({
    limit: QUERY_LIMIT
  });
  const stripeSubscriptionProducts = stripeSubscriptionProductsRes.data;

  const clientPlans = Object.keys(aggregatedPlan).map((productId) => {
    const product =
      stripeSubscriptionProducts.find(product => product.id === productId);
    return {
      id: productId,
      pricing: aggregatedPlan[productId].pricing.map(price => convertObjToCamelCase(price)),
      attributes: convertObjToCamelCase(pick(product,
        SUBSCRIPTION_PLAN_ATTRIBUTES_TO_TAKE_FROM_STRIPE)),
    }
  });

  return {
    status: 200,
    data: clientPlans
  };
}

export default query;
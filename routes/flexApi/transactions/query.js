import subscriptionSdk from "../../../services/subscription";
import { transformClientQueryParams } from "../../../services/utils";
import { SUBSCRIPTION_PLAN_TYPE, SUBSCRIPTION_TYPE } from "./types";
import transactionWrapper from '../../../services/transactions';

const query = async (req, res, next) => {
  const queryParams = transformClientQueryParams(req.query);
  const { type } = queryParams;
  switch (type) {
    case SUBSCRIPTION_TYPE:
    case SUBSCRIPTION_PLAN_TYPE: {
      const result = await subscriptionSdk
        .plan.query({
          clientTokenStore: res.locals.tokenStore,
          clientQueryParams: req.query
        });
      res.locals.response = result.data;
      res.status(result.code);
      return res.send({ data: result.data });
    }
    default: {
      const result = await transactionWrapper
        .transaction.query({
          clientTokenStore: res.locals.tokenStore,
          clientQueryParams: req.query
        });
      res.locals.response = result.data;
      res.status(result.code);
    }
  }
  next();
}

export default query;
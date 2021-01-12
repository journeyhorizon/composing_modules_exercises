import subscriptionSdk from "../../../services/subscription";
import { transformClientQueryParams } from "../../../services/utils";
import { SUBSCRIPTION_PLAN_TYPE, SUBSCRIPTION_TYPE } from "./types";
import { createFlexErrorObject, WRONG_PARAMS } from "../../../services/error";

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
      res.locals.response = createFlexErrorObject({
        code: 400,
        message: WRONG_PARAMS,
        messageCode: WRONG_PARAMS
      });
      res.status(400);
    }
  }
  next();
}

export default query;
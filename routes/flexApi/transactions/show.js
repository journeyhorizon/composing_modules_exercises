import { transformClientQueryParams } from "../../../services/utils";
import { SUBSCRIPTION_TYPE } from "./types";
import transactionWrapper from '../../../services/transactions';
import { createFlexErrorObject } from "../../../services/on_behalf_of/error";
import { WRONG_PARAMS } from "../../../services/error_type";

const show = async (req, res, next) => {
  const queryParams = transformClientQueryParams(req.query);
  const { type } = queryParams;
  switch (type) {
    case SUBSCRIPTION_TYPE: {
      const result = await transactionWrapper
        .subscription.show({
          clientTokenStore: res.locals.tokenStore,
          clientQueryParams: req.query
        });
      res.locals.response = result.data;
      res.status(result.code);
      return res.send(result.data);
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

export default show;
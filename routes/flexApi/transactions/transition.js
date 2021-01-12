import { createFlexErrorObject, WRONG_PARAMS } from '../../../services/error';
import transactionWrapper from '../../../services/transactions';
import { transformClientQueryParams } from '../../../services/utils';
import { SUBSCRIPTION_TYPE } from './types';

const transition = async (req, res, next) => {
  const queryParams = transformClientQueryParams(req.query);
  const { type } = queryParams;
  if (type === SUBSCRIPTION_TYPE) {
    const result = await transactionWrapper
      .subscription.transition({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
  } else {
    res.locals.response = createFlexErrorObject({
      code: 400,
      message: WRONG_PARAMS,
      messageCode: WRONG_PARAMS
    });
    res.status(400);
  }
  next();
};

export default transition;
import transactionWrapper from '../../../services/transactions';
import { transformClientQueryParams } from '../../../services/utils';
import { SUBSCRIPTION_TYPE } from './types';

const initiate = async (req, res, next) => {
  const queryParams = transformClientQueryParams(req.query);
  const { type } = queryParams;
  if (type === SUBSCRIPTION_TYPE) {
    const result = await transactionWrapper
      .subscription.initiate({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
  } else {
    const result = await transactionWrapper
      .transaction.initiate({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
  }
  next();
};

export default initiate;
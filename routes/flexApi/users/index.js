import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import { transformClientQueryParams } from '../../../services/utils';
import { QUERY_USERS_ACTION, UPDATE_USER_ACTION, REMOVE_USER_ACTION } from './type';
import { createFlexErrorObject } from '../../../services/error';
import { WRONG_PARAMS } from '../../../services/error';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';

const express = require('express');
const router = express.Router();

router.get('/show',
  handleAsyncWrapper(async (req, res, next) => {
    const queryParams = transformClientQueryParams(req.query);
    const { action } = queryParams
    switch (action) {
      case QUERY_USERS_ACTION: {
        const result = await OnBeHalfOfSdk
          .company.enterprise.query({
            clientQueryParams: req.query,
            clientTokenStore: res.locals.tokenStore,
          });
        res.locals.response = result.data;
        res.status(result.code);
        return res.send(result.data);
      }
      // Includes: Add and Edit the company user.
      case UPDATE_USER_ACTION: {
        const result = await OnBeHalfOfSdk
          .company.enterprise.change({
            clientQueryParams: req.query,
            clientTokenStore: res.locals.tokenStore,
          });
        res.locals.response = result.data;
        res.status(result.code);
        return res.send(result.data);
      }
      case REMOVE_USER_ACTION: {
        const result = await OnBeHalfOfSdk
          .company.enterprise.cancel({
            clientQueryParams: req.query,
            clientTokenStore: res.locals.tokenStore,
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
  }, { retries: config.retries }));

module.exports = router;

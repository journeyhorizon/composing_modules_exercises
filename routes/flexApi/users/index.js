import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import { transformClientQueryParams } from '../../../services/utils';
import { QUERY_USERS_ACTION, UPDATE_USER_ACTION, REMOVE_USER_ACTION } from './type';
import { createFlexErrorObject } from '../../../services/on_behalf_of/error';
import { WRONG_PARAMS } from '../../../services/error_type';
import AdminSdk from '../../../services/admin';
const express = require('express');
const router = express.Router();

router.get('/show',
  handleAsyncWrapper(async (req, res, next) => {
    const queryParams = transformClientQueryParams(req.query);
    const { action } = queryParams
    switch (action) {
      case QUERY_USERS_ACTION: {
        const result = await AdminSdk
          .company.enterprise.query(req.query);
        res.locals.response = result.data;
        res.status(result.code);
        return res.send(result.data);
      }
      // Includes: Add and Edit the user.
      case UPDATE_USER_ACTION: {
        const result = await AdminSdk
          .company.enterprise.change(req.query);
        res.locals.response = result.data;
        res.status(result.code);
        return res.send(result.data);
      }
      case REMOVE_USER_ACTION: {
        const result = await AdminSdk
          .company.enterprise.cancel(req.query);
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

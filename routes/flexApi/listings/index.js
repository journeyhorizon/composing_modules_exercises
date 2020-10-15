import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';

const express = require('express');
const router = express.Router();

router.get('/show',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .listings.show({
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

module.exports = router;

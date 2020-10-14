import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import transactionWrapper from '../../../services/transactions';

const express = require('express');
const router = express.Router();

router.post('/initiate',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await transactionWrapper
      .transaction.initiate({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/initiate_speculative',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await transactionWrapper
      .transaction.initiateSpeculative({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/transition',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await transactionWrapper
      .transaction.transition({
        ...res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/transition_speculative',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await transactionWrapper
      .transaction.transitionSpeculative({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

module.exports = router;
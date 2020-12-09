import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import transactionWrapper from '../../../services/transactions';
import query from './query';
import initiate from './initiate';
import initiateSpeculative from './speculate';
import show from './show';
import transition from './transition';

const express = require('express');
const router = express.Router();

router.get('/query', handleAsyncWrapper(query, { retries: config.retries }));

router.get('/show', handleAsyncWrapper(show, { retries: config.retries }));

router.post('/initiate',
  handleAsyncWrapper(initiate, { retries: config.retries }));

router.post('/initiate_speculative',
  handleAsyncWrapper(initiateSpeculative, { retries: config.retries }));

router.post('/transition',
  handleAsyncWrapper(transition, { retries: config.retries }));

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

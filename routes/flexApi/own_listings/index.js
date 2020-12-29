import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';

const express = require('express');
const router = express.Router();

router.get('/show',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.show({
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.get('/query',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.query({
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/create_draft',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.createDraft({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/publish_draft',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.publishDraft({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/open',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.open({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/close',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.close({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

router.post('/update',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .ownListings.update({
        data: res.locals.parsedBody,
        clientTokenStore: res.locals.tokenStore,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

module.exports = router;

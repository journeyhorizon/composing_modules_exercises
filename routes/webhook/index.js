import { handleAsyncWrapper } from '../../services/request_handle_wrapper';
import config from '../../services/config';
import { stripe } from '../../services/stripe';
import wrappedFlexSdk from '../../services/transactions';

const express = require('express');
const router = express.Router();

router.post('/api/webhook/stripe', express.raw({ type: 'application/json' }),
  handleAsyncWrapper(async (req, res, next) => {
    const result = await stripe.jh.webhook.receive(req.body,
      req.headers['stripe-signature'],
      config.stripe.endpointSecret);
    return res.status(result.code).send(result.data);
  }, { retries: config.retries }));

router.post('/api/webhook/stripe/connect', express.raw({ type: 'application/json' }),
  handleAsyncWrapper(async (req, res, next) => {
    const result = await stripe.jh.webhook.receive(req.body,
      req.headers['stripe-signature'],
      config.stripe.connectEndpointSecret);
    return res.status(result.code).send(result.data);
  }, { retries: config.retries }));

router.post('/api/webhook/flex/event', express.json(),
  handleAsyncWrapper(async (req, res, next) => {
    const result = await wrappedFlexSdk.event.receive(req.body,
      req.headers['authentication-signature']);
    return res.status(result.code).send(result.data);
  }, { retries: config.retries }));

module.exports = router;

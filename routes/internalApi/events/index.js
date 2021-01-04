import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import eventSDK from '../../../services/events';

const express = require('express');
const router = express.Router();

router.post('/', handleAsyncWrapper(async (req, res, next) => {
  //TODO:JH remove this log after we have confirm AWS hook from prod
  console.log(req.body);
  const body = typeof req.body === 'string'
    ? JSON.parse(req.body)
    : req.body;
  const params = typeof body.Message === 'string'
    ? JSON.parse(body.Message)
    : body.Message;
  const result = await eventSDK.jobs.updateListings(params);
  return res.status(result.code).send(result.data);
}, { retries: config.retries }));

module.exports = router;
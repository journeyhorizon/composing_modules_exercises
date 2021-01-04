import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';

const express = require('express');
const router = express.Router();

router.post('/', handleAsyncWrapper(async (req, res, next) => {
  // const body = typeof req.body === 'string'
  //   ? JSON.parse(req.body)
  //   : req.body;
  // const params = typeof body.Message === 'string'
  //   ? JSON.parse(body.Message)
  //   : body.Message;
  // //TODO:JH remove this log after we have confirm AWS hook from prod
  // console.log(params)
  // const result = await eventSDK.jobs.updateListings(params);
  // return res.status(result.code).send(result.data);
  return res.status(200).send({
    message: 'ok'
  });
}, { retries: config.retries }));

module.exports = router;
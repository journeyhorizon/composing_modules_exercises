import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';

const express = require('express');
const router = express.Router();

router.use(express.json({
  type: 'application/json'
}));

router.post('/', handleAsyncWrapper(async (req, res, next) => {
  //TODO:JH remove this log after we have confirm AWS hook from prod
  const data = req.body;
  return res.status(200).send({
    received: true,
    data
  });
}, { retries: config.retries }));

module.exports = router;
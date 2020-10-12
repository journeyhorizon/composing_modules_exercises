import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import { handleEvents } from '../../../services/event';

const express = require('express');
const router = express.Router();

router.post('/', handleAsyncWrapper(async (req, res, next) => {
  const result = await handleEvents(req.body);
  return res.status(result.code).send(result.data);
}, { retries: config.retries }));

module.exports = router;

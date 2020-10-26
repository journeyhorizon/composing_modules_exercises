import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';
import { createTransitConverters } from '../../../services/serializer';
import { typeHandlers } from '../../../services/sharetribe';

const express = require('express');
const router = express.Router();

const transitJsonParser = (req, res, next) => {
  const data = req.body;

  const { reader } = createTransitConverters(typeHandlers);

  res.locals.parsedBody = reader.read(data);
  next();
};

router.use(transitJsonParser);

router.post('/request',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .passwordReset.request({
        data: res.locals.parsedBody,
        clientQueryParams: req.query
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

module.exports = router;

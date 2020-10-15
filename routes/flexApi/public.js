import { createTransitConverters } from '../../services/serializer';
import { typeHandlers } from '../../services/sharetribe';
import isEmpty from 'lodash/isEmpty';

const express = require('express');
const router = express.Router();

router.use(express.raw({ type: 'application/transit+json' }));

router.use('/listings', require('./listings'));

const responseParser = (req, res, next) => {
  if (isEmpty(res.locals.response)) {
    return next();
  }
  res.setHeader('Content-Type', 'application/transit+json');
  const { writer } = createTransitConverters(typeHandlers);
  const parsedData = writer.write(res.locals.response);
  return res.send(parsedData);
};

router.use(responseParser);

module.exports = router;

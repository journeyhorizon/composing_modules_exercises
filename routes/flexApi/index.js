import { createTransitConverters } from '../../services/serializer';
import { typeHandlers } from '../../services/sharetribe';
import { INVALID_TOKEN } from '../../services/error_type';

const express = require('express');
const router = express.Router();

const transitJsonParser = (req, res, next) => {
  const data = req.body;
  const { reader } = createTransitConverters(typeHandlers);

  res.locals.parsedBody = reader.read(data);
  next();
};

const tokenStoreParser = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token || !token.includes('Bearer')) {
    return res.status(403).send({
      message: INVALID_TOKEN
    });
  }

  const cookieTokenStore = {
    access_token: token.split(' ')[1],
    token_type: 'bearer',
    scope: 'user'
  };
  res.locals.tokenStore = cookieTokenStore;
  next();
};

router.use(express.raw({ type: 'application/transit+json' }));

router.use(transitJsonParser);

router.use(tokenStoreParser);

router.use('/transactions', require('./transactions'));

const responseParser = (req, res, next) => {
  res.setHeader('Content-Type', 'application/transit+json');
  const { writer } = createTransitConverters(typeHandlers);
  const parsedData = writer.write(res.locals.response);
  return res.send(parsedData);
};

router.use(responseParser);

module.exports = router;

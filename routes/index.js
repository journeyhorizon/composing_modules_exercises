import { handleAsyncWrapper } from '../services/request_handle_wrapper';
import config from '../services/config';

const cookieParser = require('cookie-parser');
const express = require('express');
const router = express.Router();
const cors = require('cors');

const whitelist = [
  'https://journeyh.io',
  'http://localhost:3000',
  'https://flex-console.sharetribe.com',
];


const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 ||
      typeof origin === "undefined") {
      callback(null, true)
    } else {
      console.log(`Not allowed origin ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

router.use(cors(corsOptions));

/* For testing server is alive */
router.get('/', handleAsyncWrapper(async (req, res, next) => {
  return res.status(200).send({
    message: 'ok'
  });
}, { retries: config.retries }));

router.use('/v1', require('./flex'));

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());
router.use('/api', require('./api'));


module.exports = router;

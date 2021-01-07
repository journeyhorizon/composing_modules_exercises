import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import fetch from 'node-fetch';

const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post('/token',
  handleAsyncWrapper(async (req, res, next) => {
    const params = new URLSearchParams();
    Object.keys(req.body).map(key => {
      params.append(key, req.body[`${key}`]);
    })
    const baseURL = config.sharetribeFlex.baseUrl;
    const resData = await fetch(`${baseURL}/v1/auth/token`, {
      method: 'POST',
      body: params,
      headers: {
        ...req.headers,
        'host': 'flex-api.sharetribe.com'
      }
    })
      .then(response => {
        return {
          status: response.status,
          headers: response.headers.raw(),
          body: response.body.read().toString()
        };
      });
    Object.entries(resData.headers).map(([header, value]) => {
      res.set(header, value[0]);
    })
    return res.status(resData.status).send(JSON.parse(resData.body));
  }, { retries: config.retries }));

module.exports = router;

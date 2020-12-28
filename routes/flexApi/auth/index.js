import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import fetch from 'node-fetch';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';

const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));



router.post('/token',
  handleAsyncWrapper(async (req, res, next) => {

    const handleRefreshToken = async () => {
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
      try {
        return res.status(resData.status).send(JSON.parse(resData.body));
      } catch (e) {
        console.log(resData.body)
        return res.status(resData.status).send(resData.body);
      }
    }

    const handleVerifyTeamMember = async () => {
      const resData = await OnBeHalfOfSdk.login({
        data: req.body
      });
      res.set('content-type', 'application/json');
      return res.status(resData.code).send(resData.data);
    };

    if (req.body && req.body.grant_type === 'password') {
      return handleVerifyTeamMember();
    } else {
      return handleRefreshToken();
    }
  }, { retries: config.retries }));

module.exports = router;

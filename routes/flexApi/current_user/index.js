import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';
import handleCompanyAccessRequest from './company_access_request';

const express = require('express');
const router = express.Router();

router.post('/update_profile',
  handleAsyncWrapper(handleCompanyAccessRequest, { retries: config.retries }));

router.post('/create',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await OnBeHalfOfSdk
      .currentUser.create({
        data: res.locals.parsedBody,
      });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));


module.exports = router;

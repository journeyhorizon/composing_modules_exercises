import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import authenticateTeamMember from '../../../services/authentication';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';

const express = require('express');
const router = express.Router();

router.post('/update_profile',
  handleAsyncWrapper(async (req, res, next) => {
    const result = await authenticateTeamMember({
      clientTokenStore: res.locals.tokenStore,
    });
    res.locals.response = result.data;
    res.status(result.code);
    next();
  }, { retries: config.retries }));

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

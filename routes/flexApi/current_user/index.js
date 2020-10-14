import { handleAsyncWrapper } from '../../../services/request_handle_wrapper';
import config from '../../../services/config';
import authenticateTeamMember from '../../../services/authentication';

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

module.exports = router;

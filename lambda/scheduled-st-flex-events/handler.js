'use strict';

const SCHEDULY_PAYOUT_EVENT = 'SCHEDULY_PAYOUT';


module.exports.fetchStFlexEvents = require('./fetch_st_flex_events');

module.exports.triggerPayout = async (event, context) => {
  const axios = require('axios');
  console.info(`Your cron function "${context.functionName}" ran at ${new Date()}`);
  const serverUrl = process.env.EXTERNAL_SERVER_URL;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'authentication-signature': process.env.AUTHENTICATION_SIGNATURE
    }
  };
  await axios.post(serverUrl + '/', {
    attributes: {
      eventType: SCHEDULY_PAYOUT_EVENT,
      resource: {},
    },
  }, config);
};

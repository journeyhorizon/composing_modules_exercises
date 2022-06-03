'use strict';


module.exports.fetchStFlexEvents = require('./fetch_st_flex_events');

module.exports.triggerPayout = async (event, context) => {
  const axios = require('axios');
  console.info(`Your cron function "${context.functionName}" ran at ${new Date()}`);
  const serverUrl = process.env.EXTERNAL_SERVER_URL;
  const config = { headers: { 'Content-Type': 'application/json' } };
  await axios.post(serverUrl + '/', {}, config);
};

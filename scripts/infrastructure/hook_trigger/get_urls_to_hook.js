/**
 * 
 * @param {object} records 
 * @returns {[
 * hosts: [{
 *    {
 *      hostname: 'api.journeyh.io', //Example hostname,
 *      path: '/v1/api/events'
 *    }
 *  }], 
 *  records
 * ]}
 */

const getUrlsToHook = async (records) => {
  //TODO: Need to fetch urls from somewhere, maybe from a DynamoDB table?
  //Do this later, for MVP use hard-coded urls
  const
  return {
    hosts: JSON.parse(process.env.HOSTS),
    records
  };
}

module.exports = getUrlsToHook;
const getUrlsToHook = async (records) => {
  //TODO: Need to fetch urls from somewhere, maybe from a DynamoDB table?
  //Do this later, for MVP use hard-coded urls
  return {
    hosts: [
      {
        hostname: '543ab60235d8.ngrok.io',
        path: '/jh/v1/api/events'
      }
    ],
    records
  };
}

module.exports = getUrlsToHook;
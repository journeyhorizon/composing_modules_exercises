const requestWrapper = require('./request_wrapper');

const handleFireEvents = async ({
  hosts,
  records
}) => {
  return new Promise(async (resolve) => {
    const result = {
      ok: true,
      data: [],
      failed: []
    };

    const handleResolvePromise = () => {
      if (result.data.length + result.failed.length === hosts.length) {
        resolve(result);
      }
    }

    for (const host of hosts) {
      const {
        hostname,
        path
      } = host;

      requestWrapper(
        records,
        {
          hostname,
          path,
          method: 'POST',
        })
        .then(res => {
          result.data.push({
            host,
            res
          });
          handleResolvePromise();
        })
        .catch(e => {
          result.ok = false;
          result.records = records;
          result.failed.push({
            host,
          });
          handleResolvePromise();
        });
    }
  })
}

module.exports = handleFireEvents;
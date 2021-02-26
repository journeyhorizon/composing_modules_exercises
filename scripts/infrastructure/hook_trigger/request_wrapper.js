const https = require('https');

const requestWrapper = (rawData, options = {}) => {
  const data = JSON.stringify(rawData);
  options.headers = {
    'Content-Type': 'application/json',
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.on('data', (d) => {
        if (res.statusCode > 199 && res.statusCode < 300) {
          resolve(d.toString());
        } else {
          reject(d.toString());
        }
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.write(data);
    req.end();
  })
}

module.exports = requestWrapper;
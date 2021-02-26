const AWS = require('aws-sdk');

const promisifyAWSCall = func => params => {
  return new Promise((resolve, reject) => {
    func(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  });
}

const dynamodbService = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
});

const rawDynamoDBInstance = new AWS.DynamoDB.DocumentClient({
  service: dynamodbService
});

const batchWritePromise = promisifyAWSCall(rawDynamoDBInstance.batchWrite.bind(rawDynamoDBInstance));

const batchWriteItemPretty = (tableName) => (records) => {
  const params = { RequestItems: {} };
  params.RequestItems[tableName] = records.map(record => {
    return {
      PutRequest: {
        Item: {
          ...record
        }
      }
    };
  });
  return batchWritePromise(params)
    .then(data => records);
}

const getNewTriggerDate = () => {
  return (new Date().getTime() / 1000) + 900; //Retry one time after 15 minutes
}

const handleRescheduledFailedEvents = async ({
  result,
  tableName
}) => {
  const { failed: endpointsToRetry, records } = result;
  return batchWriteItemPretty(tableName)(records
    .filter(record => {
      // We only retry once
      return !record.endpointsToRetry;
    })
    .map(record => {
      return {
        ...record,
        triggerDate: getNewTriggerDate(),
        endpointsToRetry
      };
    }))
}

module.exports = handleRescheduledFailedEvents;
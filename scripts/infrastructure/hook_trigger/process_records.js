const convertDynamoObj2Json = require('./convert_dynamo_obj_2_json');
const REMOVE_EVENT = 'REMOVE';
const ALLOWED_EVENTS = [REMOVE_EVENT];

const processRecords = async (records) => {
  return records
    .filter(record => {
      const {
        eventName,
        dynamodb
      } = record;

      return ALLOWED_EVENTS.includes(eventName) && dynamodb;
    })
    .map(record => {
      return convertDynamoObj2Json(record.dynamodb.OldImage);
    });
}

module.exports = processRecords;
import rawDynamoDBInstance from "./init";
import {
  createExpressionAttributeValues,
  createFilterExpression,
  promisifyAWSCall
} from "./util";

const scanPromise = promisifyAWSCall(rawDynamoDBInstance.scan.bind(rawDynamoDBInstance));

const scanItemPretty = (tableName) => (keyPairs, operation = 'AND') => {
  return scanPromise({
    TableName: tableName,
    FilterExpression: createFilterExpression(keyPairs, operation),
    ExpressionAttributeValues: createExpressionAttributeValues(keyPairs),
  })
    .then(data => data.Attributes
      ? data.Attributes
      : data);
}

export default scanItemPretty;
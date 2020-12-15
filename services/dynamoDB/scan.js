import rawDynamoDBInstance from "./init";
import {
  createExpressionAttributeValues,
  createFilterExpression,
  promisifyAWSCall
} from "./util";
import isEmpty from 'lodash/isEmpty';

const scanPromise = promisifyAWSCall(rawDynamoDBInstance.scan.bind(rawDynamoDBInstance));

let totalItems = {};
const scanItemPretty = (tableName) => async ({ keyPairs, operation = 'AND', startKey }) => {
  const params = {
    TableName: tableName,
    FilterExpression: createFilterExpression(keyPairs, operation),
    ExpressionAttributeValues: createExpressionAttributeValues(keyPairs),
  };
  if (startKey) {
    params.ExclusiveStartKey = startKey;
  }

  return scanPromise(params)
    .then(data => {
      const currentItem = data.Attributes
        ? data.Attributes
        : data;

      if (data.LastEvaluatedKey) {
        const {
          Items = [],
          Count = 0,
          ScannedCount = 0,
          Attributes = {},
        } = totalItems || {};

        totalItems.Items = [...Items, ...currentItem.Items];
        totalItems.Count = Count + currentItem.Count;
        totalItems.ScannedCount = ScannedCount + currentItem.ScannedCount;
        totalItems.LastEvaluatedKey = currentItem.LastEvaluatedKey;
        totalItems.Attributes = { ...Attributes, ...currentItem.Attributes };
        return scanItemPretty(tableName)({ keyPairs, operation, startKey: data.LastEvaluatedKey })
      }

      if (isEmpty(totalItems)) {
        return currentItem;
      }

      return totalItems.Attributes
        ? totalItems.Attributes
        : totalItems;
    });
}

export default scanItemPretty;
import rawDynamoDBInstance from "./init";
import {
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  createUpdateExpression,
  promisifyAWSCall
} from "./util";

const updatePromise = promisifyAWSCall(rawDynamoDBInstance.update.bind(rawDynamoDBInstance));

const updateItemPretty = (tableName) => (keyPairs, updatedAttributes) => {
  return updatePromise({
    TableName: tableName,
    Key: {
      ...keyPairs
    },
    ExpressionAttributeNames: createExpressionAttributeNames(updatedAttributes),
    ExpressionAttributeValues: createExpressionAttributeValues(updatedAttributes),
    UpdateExpression: createUpdateExpression(updatedAttributes),
    ReturnValues: "ALL_NEW",
  })
    .then(data => data.Attributes
      ? data.Attributes
      : data);
}

export default updateItemPretty;
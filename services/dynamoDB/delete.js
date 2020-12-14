import rawDynamoDBInstance from "./init";
import {
  createExpressionAttributeNames,
  createExpressionAttributeValues,
  promisifyAWSCall,
} from "./util";

const deletePromise = promisifyAWSCall(rawDynamoDBInstance.delete.bind(rawDynamoDBInstance));

const deleteItemPretty = (tableName) => (keyPairs, deletedAttributes) => {
  return deletePromise({
    TableName: tableName,
    Key: {
      ...keyPairs,
    },
    ExpressionAttributeNames: createExpressionAttributeNames(deletedAttributes),
    ExpressionAttributeValues: createExpressionAttributeValues(deletedAttributes),
  })
    .then(data => data.Attributes
      ? data.Attributes
      : data
    );
}

export default deleteItemPretty;
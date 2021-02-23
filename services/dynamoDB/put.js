import rawDynamoDBInstance from "./init";
import { promisifyAWSCall } from "./util";

const putPromise = promisifyAWSCall(rawDynamoDBInstance.put.bind(rawDynamoDBInstance));

const putItemPretty = (tableName) => (keyPairs) => {
  return putPromise({
    TableName: tableName,
    Item: {
      ...keyPairs
    }
  })
    .then(data => keyPairs);
}

export default putItemPretty;
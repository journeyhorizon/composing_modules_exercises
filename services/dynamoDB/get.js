import rawDynamoDBInstance from "./init";
import { promisifyAWSCall } from "./util";

const getPromise = promisifyAWSCall(rawDynamoDBInstance.get.bind(rawDynamoDBInstance));

const getItemPretty = (tableName) => (keyPairs) => {
  return getPromise({
    TableName: tableName,
    Key: {
      ...keyPairs
    }
  })
    .then(data => data.Item
      ? data.Item
      : data);
};

export default getItemPretty;
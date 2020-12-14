import config from '../../../../config';
import dynamoDBSdk from '../../../../dynamoDB';

const removeItemInDynamoDB = (fnParams) => async () => {
  const { customerId } = fnParams;
  return dynamoDBSdk(config.aws.dynamodb.tableName).delete({ id: customerId });
}

export default removeItemInDynamoDB;
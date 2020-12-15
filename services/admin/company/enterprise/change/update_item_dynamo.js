import config from '../../../../config';
import dynamoDBSdk from '../../../../dynamoDB';

const updateItemInDynamoDB = (fnParams) => async () => {
  const { customerId, quantity } = fnParams;
  return dynamoDBSdk(config.aws.dynamodb.enterpriseTable).put({ id: customerId, quantity });
}

export default updateItemInDynamoDB;

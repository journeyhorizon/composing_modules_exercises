import config from '../../../../config';
import dynamoDBSdk from '../../../../../services/dynamoDB';

const fetchAllDataInDynamoDB = async () => {
  return dynamoDBSdk(config.aws.dynamodb.tableName).scan();
}

export default fetchAllDataInDynamoDB;

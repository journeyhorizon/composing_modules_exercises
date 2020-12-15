import config from '../../../../config';
import dynamoDBSdk from '../../../../../services/dynamoDB';

const fetchAllDataInDynamoDB = async () => {
  return dynamoDBSdk(config.aws.dynamodb.enterpriseTable).scan({});
}

export default fetchAllDataInDynamoDB;
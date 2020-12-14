import config from '../../../../config';
import dynamoDBSdk from '../../../../../services/dynamoDB';

const fetchAllDataInDynamoDB = async (lastKey) => {
  return dynamoDBSdk(config.aws.dynamodb.tableName).scan({
    startKey: lastKey
  });
}

export default fetchAllDataInDynamoDB;
import AWS from 'aws-sdk';
import config from "../config";

const dynamodbService = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  region: config.aws.region
});

const rawDynamoDBInstance = new AWS.DynamoDB.DocumentClient({
  service: dynamodbService
});

export default rawDynamoDBInstance;
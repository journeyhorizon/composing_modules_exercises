import config from '../config';
import { createInstance } from '../dynamoDB';

export const dynamoDBPayoutSdk = createInstance(config.payoutService.dynamoDbTableName);
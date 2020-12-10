import get from './get';
import scan from './scan';
import update from './update';
import put from './put';

const dynamoDBSdk = (tableName) => {
  return {
    get: get(tableName),
    scan: scan(tableName),
    update: update(tableName),
    put: put(tableName),
  };
};

export default dynamoDBSdk;
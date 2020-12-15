import get from './get';
import scan from './scan';
import update from './update';
import put from './put';
import deleteItem from './delete';

const dynamoDBSdk = (tableName) => {
  return {
    get: get(tableName),
    scan: scan(tableName),
    update: update(tableName),
    put: put(tableName),
    delete: deleteItem(tableName),
  };
};

export default dynamoDBSdk;
import get from './get';
import scan from './scan';
import update from './update';
import put from './put';
import deleteItem from './delete';

const sdk = {
  get,
  scan,
  update,
  put,
  delete: deleteItem
};

const createSdkInstance = tableName => Object.entries(sdk)
  .reduce((currentSdkSection, [key, values]) => {
    if (values instanceof Function) {
      const fnc = values;
      currentSdkSection[key] = (...args) =>
        fnc(tableName)(...args);
    } else {
      currentSdkSection[key] = injectTableName(values);
    }
    return currentSdkSection;
  }, {});

export const createInstance = createSdkInstance;
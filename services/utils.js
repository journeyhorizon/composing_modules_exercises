import { transform, set, camelCase } from 'lodash'
import {
  isArray, isObjectLike, isPlainObject, map,
} from 'lodash/fp'
import fs from 'fs';

export const traceAsync = flag => async (data) => {
  console.log(flag, data);
  return data;
}

export const tracePipe = flag => data => {
  console.log(flag, data);
  return data;
}

const composeMRight = method => (...ms) => (
  ms.reduceRight((f, g) => x => g(x)[method](f))
);
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
export const composePromises = composeMRight('then');

export const transformClientQueryParams = clientQueryParams => {
  return Object.entries(clientQueryParams).reduce((result, [key, value]) => {
    if (!value.includes(',')) {
      const numberOnlyReg = /^\d+$/;
      if (numberOnlyReg.test(value)) {
        result[key] = parseInt(value);
      } else {
        if (value === 'true') {
          result[key] = true;
        } else if (value === 'false') {
          result[key] = false;
        } else {
          result[key] = value;
        }
      }
    } else {
      result[key] = value.split(',');
    }
    return result;
  }, {});
}

export const addFinalizeResponseFnc = (wrapper) => {
  return Object.entries(wrapper)
    .reduce((currentWrapper, [key, values]) => {
      if (values instanceof Function) {
        const fnc = values;
        currentWrapper[key] = (...args) =>
          fnc(...args)
            .then(res => {
              return {
                code: res.status || res.code,
                data: res.data
              };
            })
            .catch(e => {
              console.error(e);
              console.log({
                e
              })
              return {
                code: e.status || e.code
                  ? e.status || e.code
                  : 500,
                data: e.data ? e.data : e.toString()
              };
            });
      } else {
        currentWrapper[key] = addFinalizeResponseFnc(values);
      }
      return currentWrapper;
    }, {});
}

const createIteratee = (converter, self) => {
  return (result, value, key) => set(result, converter(key), isObjectLike(value) ? self(value) : value)
}

const createHumps = (keyConverter) => {
  return function humps(node) {
    if (isArray(node)) return map(humps, node)
    if (isPlainObject(node)) return transform(node, createIteratee(keyConverter, humps))
    return node
  }
}

export const convertObjToCamelCase = createHumps(camelCase);

export const getTextFileContent = (path) => {
  return fs.readFileSync(path, "utf8");
}

export const convertToMonetaryUnit = (amount) => {
  if (typeof amount !== 'number') {
    throw Error('This is not a number');
  }
  const actualAmount = amount / 100;
  return (Math.round(actualAmount * 100) / 100);
}
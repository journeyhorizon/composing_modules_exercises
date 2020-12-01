import curry from 'lodash/curry';
import rng from './rng';
import Validator from './params_validator';
import stringify from './stringify';
import { transform, set, camelCase } from 'lodash'
import {
  isArray, isObjectLike, isPlainObject, map,
} from 'lodash/fp'

const composeM = method => (...ms) => (
  ms.reduce((f, g) => x => g(x)[method](f))
);

export const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

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

export const validateData =
  curry((definition, data) => (new Validator(definition)).validate(data));

export const cleanObject = obj => Object.keys(obj)
  .filter(k => obj[k] != null) // Remove undef. and null.
  .reduce(
    (newObj, k) =>
      typeof obj[k] === "object"
        ? { ...newObj, [k]: cleanObject(obj[k]) } // Recurse.
        : { ...newObj, [k]: obj[k] }, // Copy value.
    {}
  );


export const uuidv4 = (options, buf, offset) => {
  options = options || {};

  const rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

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
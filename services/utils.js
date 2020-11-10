import curry from 'lodash/curry';
import rng from './rng';
import Validator from './params_validator';
import stringify from './stringify';

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

export const composePromises = composeM('then');

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
import curry from 'lodash/curry';
import Validator from './params_validator';

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
import { SERVER_FAILED_UNEXPECTEDLY } from "./error";

export const handleAsyncWrapper = (func, { retries }) =>
  async (req, res, next) =>
    handler(req, res, next, func, retries ? retries : 0);

const handler = async (req, res, next, func, remainingRetry) => {
  if (typeof func === 'undefined') {
    throw (new Error(`Need a function, instead got ${typeof func}`));
  }

  return func(req, res, next)
    .catch(err => {
      console.log(err, `Trying times ${remainingRetry}`);
      return remainingRetry > 0 ?
        handler(req, res, next, func, remainingRetry - 1)
        : res.status(500).send({
          code: 500,
          message: SERVER_FAILED_UNEXPECTEDLY,
          stringCode: SERVER_FAILED_UNEXPECTEDLY
        });
    });
}

export const functionHandler = async (func, remainingRetry) =>
  func.catch(err => {
    console.log(err, `Trying times ${remainingRetry}`);
    if (remainingRetry > 0) {
      return functionHandler(func, remainingRetry - 1);
    } else {
      throw (err);
    }
  });
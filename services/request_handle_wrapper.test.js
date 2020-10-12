const { SERVER_FAILED_UNEXPECTEDLY } = require("./error_type");
const { handleAsyncWrapper } = require("./request_handle_wrapper");

describe('Handle request processing failed on server', () => {
  const req = {};
  const next = () => { };
  const res = {
    send: async (data) => {
      return data;
    },
    status: () => {
      return {
        send: async (data) => {
          return data;
        }
      };
    }
  };

  test('it should failed and the code should retry 3 time before exit', () => {
    let fncRanAccumulator = 0;
    const supposeToFailFnc = async () => {
      fncRanAccumulator++;
      throw (new Error('Testing fail function'));
    };
    return handleAsyncWrapper(supposeToFailFnc, { retries: 3 })
      (req, res, next)
      .then(data => {
        expect(data).toEqual({
          code: 500,
          message: SERVER_FAILED_UNEXPECTEDLY,
          stringCode: SERVER_FAILED_UNEXPECTEDLY
        });
        expect(fncRanAccumulator).toBe(4);
      });
  });

  test('it success and we do not need to retry', () => {
    let fncRanAccumulator = 0;
    const supposeToSuccessFnc = async () => {
      fncRanAccumulator++;
      return {
        message: 'ok'
      };
    };
    return handleAsyncWrapper(supposeToSuccessFnc, { retries: 3 })
      (req, res, next)
      .then(data => {
        expect(data).toEqual({
          message: 'ok'
        });
        expect(fncRanAccumulator).toBe(1);
      });
  });

});
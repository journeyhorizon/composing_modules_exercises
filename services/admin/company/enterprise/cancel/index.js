import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import fetchCustomer from './fetch_user';
import checkRequirement from './verify';
import cancelPlan from './cancel';
import { createFlexErrorObject } from "../../../../on_behalf_of/error";

const ParamsValidator = new Validator({
  customerId: {
    type: 'string',
    required: true
  },
});

const cancel = async (fnParams) => {
  const validateResult = ParamsValidator.validate(fnParams);

  if (!validateResult.valid) {
    return {
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: validateResult.message,
        messageCode: validateResult.errorCode
      })
    }
  }

  const { customerId } = fnParams;

  return composePromises(
    fetchCustomer,
    checkRequirement(fnParams),
    cancelPlan,
  )(customerId);
}

export default cancel;
import Validator from "../../../../params_validator";
import { validateDefaultDefinition } from "../../../../params_validator/validate_fnc";
import { composePromises } from "../../../../utils";
import { createFlexErrorObject } from "../../../error";
import fetchCustomer from './fetch_user';
import checkRequirement from './verify';
import changePlan from './change';

const ParamsValidator = new Validator({
  customerId: {
    type: 'string',
    required: true
  },
  params: {
    type: 'custom',
    required: true,
    customCheck: validateDefaultDefinition(),
    definition: {
      quantity: {
        type: 'number',
        required: true
      }
    }
  }
});

const change = async (fnParams) => {
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
    changePlan(fnParams),
  )(customerId);
}

export default change;
import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import checkRequirement from './verify';
import cancelPlan from './cancel';
import fetchCompany from '../fetch_company';
import removeItemInDynamoDB from './remove_item_dynamo';
import finalise from './finalise';
import { createFlexErrorObject } from "../../../../on_behalf_of/error";

const ParamsValidator = new Validator({
  customerId: {
    type: 'string',
    required: true
  },
  quantity: {
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
    fetchCompany,
    checkRequirement(fnParams),
    cancelPlan,
    removeItemInDynamoDB(fnParams),
    finalise,
  )(customerId);
}

export default cancel;
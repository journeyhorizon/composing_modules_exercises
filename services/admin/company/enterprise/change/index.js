import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import { createFlexErrorObject } from "../../../error";
import checkRequirement from './verify';
import changePlan from './change';
import fetchCompany from "../fetch_company";
import updateItemInDynamoDB from './update_item_dynamo';
import finalise from './finalise';

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
    fetchCompany,
    checkRequirement(fnParams),
    changePlan(fnParams),
    updateItemInDynamoDB(fnParams),
    finalise,
  )(customerId);
}

export default change;
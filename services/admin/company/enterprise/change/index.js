import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import { createFlexErrorObject } from "../../../error";
import checkRequirement from './verify';
import changePlan from './change';
import verifyAdminRole from "../../verify_admin";
import fetchCurrentUser from "../fetch_current_user";
import fetchCustomer from "../fetch_customer";
import updateItemInDynamoDB from './update_item_dynamo';
import fetchAllDataInDynamoDB from './fetch_dynamo';
import finalise from './finalise';

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
  },
  customerId: {
    type: 'string',
    required: true
  },
  action: {
    type: 'string',
    required: true
  },
  quantity: {
    type: 'string',
    required: true
  },
  page: {
    type: 'string',
    required: true
  },
  per_page: {
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

  const { id: userId, customerId } = fnParams;
  return composePromises(
    fetchCurrentUser,
    verifyAdminRole,
    fetchCustomer(customerId),
    checkRequirement(fnParams),
    changePlan(fnParams),
    updateItemInDynamoDB(fnParams),
    fetchAllDataInDynamoDB,
    finalise(fnParams),
  )(userId);
}

export default change;
import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import checkRequirement from './verify';
import cancelPlan from './cancel';
import fetchCurrentUser from '../fetch_current_user';
import fetchCustomer from '../fetch_customer';
import removeItemInDynamoDB from './remove_item_dynamo';
import fetchAllDataInDynamoDB from './fetch_dynamo';
import finalise from './finalise';
import { createFlexErrorObject } from "../../../../on_behalf_of/error";
import verifyAdminRole from "../../verify_admin";

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

  const { id: userId, customerId } = fnParams;
  return composePromises(
    fetchCurrentUser,
    verifyAdminRole,
    fetchCustomer(customerId),
    checkRequirement(fnParams),
    cancelPlan,
    removeItemInDynamoDB(fnParams),
    fetchAllDataInDynamoDB,
    finalise(fnParams),
  )(userId);
}

export default cancel;
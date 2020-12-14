import Validator from "../../../../params_validator";
import { composePromises } from "../../../../utils";
import fetchCurrentUser from '../fetch_current_user';
import verifyAdminRole from '../../verify_admin';
import fetchAllDataInDynamoDB from './fetch_dynamo';
import finalise from "./finalise";
import { createFlexErrorObject } from "../../../error";

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
  },
  action: {
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

const query = async (fnParams) => {
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

  const { id: userId } = fnParams;

  return composePromises(
    fetchCurrentUser,
    verifyAdminRole,
    fetchAllDataInDynamoDB,
    finalise(fnParams),
  )(userId);
}

export default query;
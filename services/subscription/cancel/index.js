import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import finalise from "../update/finalise";
import cancelSub from './update_sub';
import normaliseSubscriptionData from '../update/normalise';
import fetchSubscription from '../update/fetch_subscription';

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
  },
  params: {
    type: 'custom',
    customCheck: validateDefaultDefinition({ optional: true }),
    definition: {
      protectedData: {
        type: 'custom',
        customCheck: () => ({ valid: true })
      },
    }
  }
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

  const { id, params } = fnParams;

  return composePromises(
    fetchSubscription,
    cancelSub(params),
    normaliseSubscriptionData,
    finalise
  )(id);
}

export default cancel;
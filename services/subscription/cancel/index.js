import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import finalise from "./finalise";
import cancelSub from './update_sub';
import normaliseSubscriptionData from './normalise';

const ParamsValidator = new Validator({
  subscriptionId: {
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

  const { subscriptionId, params } = fnParams;

  return composePromises(
    cancelSub(fnParams),
    normaliseSubscriptionData,
    finalise
  )({
    ...params,
    subscriptionId,
  });
}

export default cancel;
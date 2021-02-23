import finalise from "../../common/finalise";
import validateParams from "../../common/validate_params";
import Validator from "../../params_validator";
import { validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";

const ParamsValidator = new Validator({
  id: {
    type: 'string',
  },
  stripeId: {
    type: 'string',
    required: true
  },
  params: {
    type: 'custom',
    customCheck: validateDefaultDefinition(),
    definition: {
      protectedData: {
        type: 'custom',
        customCheck: () => ({ valid: true })
      },
      amount: {
        type: 'number',
        required: true
      },
      currency: {
        type: 'string',
        required: true
      },
      //If no scheduled time set, we try to pay as soon as possible.
      scheduledTime: {
        type: 'number',
      }
    }
  }
});

const create = async (fnParams) => {
  validateParams({
    params: fnParams,
    validatorInstance: ParamsValidator
  });

  return composePromises(
    checkExistingItem,
    saveItem,
    finalise
  )
}

export default create;
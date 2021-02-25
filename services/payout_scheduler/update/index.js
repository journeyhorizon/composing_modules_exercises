import finalise from "../../common/finalise";
import validateParams from "../../common/validate_params";
import Validator from "../../params_validator";
import { validateDate, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import { dynamoDBPayoutSdk as dbSdk } from '../init';
import createStorableParams from './create_storable_params';

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
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
      //Might need to change the code to check scheduled time
      //Unix timestamp
      triggerDate: {
        type: 'custom',
        customCheck: (value) => validateDate(value * 1000)
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
    createStorableParams,
    dbSdk.update,
    finalise
  )(fnParams);
}

export default create;
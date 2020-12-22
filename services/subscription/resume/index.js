import { createFlexErrorObject } from "../../on_behalf_of/error";
import Validator from "../../params_validator";
import { validateArray, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import fetchCustomer from "./fetch_user";
import finalise from "./finalise";
import checkRequirement from "./verify";
import resumeSub from './update_sub';
import updateFlexProfile from './update_profile';
import normaliseSubscriptionData from './normalise';

const ParamsValidator = new Validator({
  customerId: {
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
      lineItems: {
        type: 'custom',
        definition: [{
          pricingId: {
            type: 'string',
            required: true
          },
          quantity: {
            type: 'number',
          }
        }],
        customCheck: validateArray({ optional: true }),
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

  const { customerId } = fnParams;

  return composePromises(
    fetchCustomer,
    checkRequirement,
    resumeSub(fnParams),
    updateFlexProfile,
    normaliseSubscriptionData,
    finalise
  )(customerId);
}

export default cancel;
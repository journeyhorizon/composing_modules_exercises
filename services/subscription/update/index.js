import { createFlexErrorObject } from "../../on_behalf_of/error";
import Validator from "../../params_validator";
import { validateArray, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import fetchCustomer from "./fetch_user";
import finalise from "./finalise";
import checkRequirement from "./verify";
import updateSub from './update_sub';
import updateFlexProfile from './update_profile';
import normaliseSubscriptionData from './normalise';
import fetchUpcomingInvoice from './upcoming_invoice';

const ParamsValidator = new Validator({
  customerId: {
    type: 'string',
    required: true
  },
  params: {
    type: 'custom',
    required: true,
    customCheck: validateDefaultDefinition(),
    definition: {
      protectedData: {
        type: 'custom',
        customCheck: () => ({ valid: true })
      },
      location: {
        type: 'custom',
        definition: {
          lat: {
            type: 'string',
            required: true
          },
          lng: {
            type: 'string',
            required: true
          }
        },
        customCheck: validateArray({ optional: true }),
      },
      lineItems: {
        type: 'custom',
        required: true,
        definition: [{
          pricingId: {
            type: 'string',
            required: true
          },
          quantity: {
            type: 'number',
          }
        }],
        customCheck: validateArray(),
      },
    }
  }
});

const update = async (fnParams) => {
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
    checkRequirement(fnParams),
    updateSub(fnParams),
    updateFlexProfile,
    normaliseSubscriptionData,
    fetchUpcomingInvoice,
    finalise
  )(customerId);
}

export default update;
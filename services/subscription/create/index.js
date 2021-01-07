import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { validateArray, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import fetchCustomer from "./fetch_user";
import finalise from "./finalise";
import init from "./init";
import normaliseSubscriptionData from "./normalise";
import fetchUpcomingInvoice from "./upcoming_invoice";
import checkRequirement from "./verify";

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

const create = async (fnParams) => {
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
    init(fnParams),
    normaliseSubscriptionData,
    fetchUpcomingInvoice,
    finalise
  )(customerId);
}

export default create;
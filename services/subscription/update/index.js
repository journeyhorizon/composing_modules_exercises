import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { validateArray, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import finalise from "../common_functions/finalise";
import updateSub from './update_sub';
import normaliseSubscriptionData from '../common_functions/normalise_subscription_data';
import fetchUpcomingInvoice from '../common_functions/fetch_upcoming_invoice';
import fetchSubscription from '../common_functions/fetch_formatted_subscription';

const ParamsValidator = new Validator({
  id: {
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
          },
          quantity: {
            type: 'number',
            required: true
          },
          priceData: {
            type: 'custom',
            customCheck: validateDefaultDefinition({ optional: true }),
            definition: {
              listingId: {
                type: 'string',
                required: true
              },
              interval: {
                type: 'custom',
                required: true,
                customCheck: validateDefaultDefinition(),
                definition: {
                  period: {
                    type: 'string',
                    required: true,
                    allow: ['day', 'week', 'month', 'year'] //TODO: Move this into configuration
                  },
                  count: {
                    type: 'number',
                    required: true
                  }
                }
              },
              price: {
                type: 'custom',
                required: true,
                customCheck: validateDefaultDefinition(),
                definition: {
                  amount: {
                    type: 'number',
                    required: true
                  },
                  currency: {
                    type: 'string',
                    required: true
                  }
                }
              }
            }
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

  const { id } = fnParams;

  return composePromises(
    fetchSubscription,
    updateSub(fnParams),
    normaliseSubscriptionData,
    fetchUpcomingInvoice,
    finalise
  )(id);
}

export default update;
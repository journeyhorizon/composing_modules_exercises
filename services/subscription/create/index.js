import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { validateArray, validateDefaultDefinition } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import handleCreateSubscriptionForConnect from "./connect";
import fetchCustomer from "../common_functions/fetch_user_with_stripe_customer";
import finalise from "../../common/finalise";
import init from "./init";
import normaliseSubscriptionData from "../common_functions/normalise_subscription_data";
import fetchUpcomingInvoice from "../common_functions/fetch_upcoming_invoice";
import checkRequirement from "./verify";

const NormalParamsValidator = new Validator({
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

const ConnectParamsValidator = new Validator({
  customerId: {
    type: 'string',
    required: true
  },
  providerId: {
    type: 'string',
    required: true
  },
  params: {
    type: 'custom',
    required: true,
    customCheck: validateDefaultDefinition(),
    definition: {
      bookingStartTime: {
        type: 'number'
      },
      bookingEndTime: {
        type: 'number'
      },
      commissionPercentage: {
        type: 'number'
      },
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

const create = async (fnParams) => {
  const { customerId, providerId } = fnParams;

  const validateResult =
    providerId
      ? ConnectParamsValidator.validate(fnParams)
      : NormalParamsValidator.validate(fnParams);

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

  return providerId
    ? handleCreateSubscriptionForConnect(fnParams)
    : composePromises(
      fetchCustomer,
      checkRequirement,
      init(fnParams),
      normaliseSubscriptionData,
      fetchUpcomingInvoice,
      finalise
    )(customerId);
}

export default create;
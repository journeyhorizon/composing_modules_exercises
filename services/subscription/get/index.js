import Validator from "../../params_validator";
import { validatePrimitiveArray } from "../../params_validator/validate_fnc";
import { composePromises } from "../../utils";
import fetchStripeSubscription from "./fetch";
import finalise from "./finalise";
import { INVOICES_INCLUDE, UPCOMING_INVOICE_INCLUDE } from "./includable";
import fetchInvoiceHistory from "./invoices";
import normalise from "./normalise";
import fetchUpcomingInvoice from "./upcoming_invoices";

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
  },
  include: {
    type: 'custom',
    definition: ['string'],
    customCheck: validatePrimitiveArray({ optional: true })
  }
});

const get = async (fnParams) => {
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

  const {
    id,
    include
  } = fnParams;

  const funcToCompose = [
    fetchStripeSubscription,
    normalise,
  ];

  if (include) {
    if (include.includes(INVOICES_INCLUDE)) {
      funcToCompose.push(fetchInvoiceHistory);
    }
    if (include.includes(UPCOMING_INVOICE_INCLUDE)) {
      funcToCompose.push(fetchUpcomingInvoice);
    }
  }
  funcToCompose.push(finalise);

  return composePromises(
    ...funcToCompose
  )({ id });
}

export default get;
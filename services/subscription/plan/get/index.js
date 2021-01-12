import { createFlexErrorObject } from "../../../error";
import Validator from "../../../params_validator";
import { validatePrimitiveArray } from "../../../params_validator/validate_fnc";
import { composePromises } from "../../../utils";
import fetchStripePlanAssociatedWithProduct from "./fetch_plan";
import finalise from "../../common_functions/finalise";

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
  } = fnParams;


  return composePromises(
    fetchStripePlanAssociatedWithProduct,
    finalise
  )({
    id
  });
}

export default get;
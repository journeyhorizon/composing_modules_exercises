import { createFlexErrorObject } from "../../error";
import Validator from "../../params_validator";
import { getListingData } from "../../sharetribe_admin";
import { composePromises } from "../../utils";
import finalise from "./finalise";
import createProductParams from "./create_params";
import createProductOnStripe from "./create";
import normaliseProductData from "./normalise";

const ParamsValidator = new Validator({
  id: {
    type: 'string',
    required: true
  },
});

const create = async (fnParams) => {
  const { id } = fnParams;

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

  return composePromises(
    getListingData,
    createProductParams,
    createProductOnStripe,
    normaliseProductData,
    finalise
  )({ listingId: id, include: ['author'] });
}

export default create;
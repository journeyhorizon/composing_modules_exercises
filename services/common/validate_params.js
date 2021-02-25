import { createFlexErrorObject } from "../error";

//TODO: Replace this function with other long repetitive code to validate params
const validateParams = ({
  params,
  validatorInstance
}) => {
  const validateResult = validatorInstance.validate(params);

  if (!validateResult.valid) {
    throw ({
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: validateResult.message,
        messageCode: validateResult.errorCode
      })
    });
  }

  return params;
}

export default validateParams;
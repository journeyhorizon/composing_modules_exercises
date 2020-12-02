import { Array } from "core-js";
import {
  EMPTY_ARRAY_ERROR,
  WRONG_PARAMS,
  WRONG_ARRAY_TYPE_ERROR
} from "../error_type";
import Validator from "../params_validator";

export const validateArray = (options = {}) => (value, currentDeclaredAttribute) => {
  if (options.optional && !value) {
    return {
      valid: true
    };
  }

  if (!(value instanceof Array) || value.length < 1) {
    return {
      valid: false,
      message: EMPTY_ARRAY_ERROR,
      errorCode: EMPTY_ARRAY_ERROR
    }
  }

  const subAttributesValidator = new Validator(currentDeclaredAttribute.definition[0]);
  for (let i = 0; i < value.length; i++) {
    const validateResult = subAttributesValidator.validate(value[i]);
    if (!validateResult.valid) {
      return validateResult;
    }
  }
  return {
    valid: true
  };
}

export const validatePrimitiveArray = (options = {}) => (value, currentDeclaredAttribute) => {
  if (options.optional && !value) {
    return {
      valid: true
    };
  }

  if (!(value instanceof Array) || value.length < 1) {
    return {
      valid: false,
      message: EMPTY_ARRAY_ERROR,
      errorCode: EMPTY_ARRAY_ERROR
    }
  }

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== currentDeclaredAttribute.definition[0]) {
      return {
        valid: false,
        message: WRONG_ARRAY_TYPE_ERROR,
        errorCode: WRONG_ARRAY_TYPE_ERROR
      }
    }
  }
  return {
    valid: true
  };
}

export const validateDefaultDefinition = (options = {}) => (value, currentDeclaredAttribute) => {
  if (options.optional && !value) {
    return {
      valid: true
    };
  }

  if (currentDeclaredAttribute.definition instanceof Array) {
    return validateArray(options)(value, currentDeclaredAttribute);
  } else {
    const subAttributesValidator = new Validator(currentDeclaredAttribute.definition);
    const validateResult = subAttributesValidator.validate(value);
    return validateResult;
  }

}

export const validateDate = value => {
  const date = new Date(value);
  const valid = isNaN(date.getTime());
  return valid
    ? {
      valid,
    }
    : {
      valid,
      message: WRONG_PARAMS,
      errorCode: WRONG_PARAMS
    };
}
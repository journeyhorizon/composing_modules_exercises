import { WRONG_PARAMS } from "../error_type";

const DEFAULT_SUPPORT_TYPE = [
	'string',
	'number',
	'boolean',
	'custom'
];

/**
 * Validator class for creating params variable, the purpose is to automatically validate created params
 * 
 * @typedef {Object} ValidatorObject
 * @property {string} type The object's suppose type, can be one of the DEFAULT_SUPPORT_TYPE
 * @property {Object} definition Structure of a custom type in json
 * @property {boolean} required
 * 
 * @param {ValidatorObject} params JSon object that contain definition for desired params  
 * 
 */

class Validator {
	constructor(params) {
		Object.keys(params).forEach(key => {
			if (!params[`${key}`].type)
				throw (new Error('Invalid validation object, must have type for each object!'));
			if (!DEFAULT_SUPPORT_TYPE.includes(params[`${key}`].type))
				throw (new Error(`Invalid validation object type, must be one of [${DEFAULT_SUPPORT_TYPE.toString()}]`));
			if (params[`${key}`].type === 'custom' && (!params[`${key}`].definition && !params[`${key}`].customCheck))
				throw (new Error(`Invalid custom validation object, must have definition or custom check for custom type, error at ${key}`));
			this[`${key}`] = params[`${key}`];
		});
	}

	validate(params) {
		const allowedKeys = Object.keys(this);

		let checkResult = {
			valid: true,
			params
		}

		const inputKeys = Object.keys(params);

		const disallowedKeys = inputKeys.filter(inputtedKey => {
			return !allowedKeys.includes(inputtedKey);
		});

		if (Array.isArray(disallowedKeys) && disallowedKeys.length > 0) {
			return {
				valid: false,
				message: `Unexpected keys ${disallowedKeys}`,
				errorCode: WRONG_PARAMS
			}
		}

		inputKeys.forEach(key => {
			if (!allowedKeys.includes(key)) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} not exist in definition`,
					errorCode: WRONG_PARAMS
				};
				return;
			}
			if (typeof params[`${key}`] !== this[`${key}`].type && this[`${key}`].type !== 'custom') {
				checkResult = {
					valid: false,
					message: `Params key named ${key} type is incorrect, found ${typeof params[`${key}`]} need ${this[`${key}`].type}`,
					errorCode: WRONG_PARAMS
				}
				return;
			}
			if (this[`${key}`].allow && !this[`${key}`].allow.includes(params[`${key}`])) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} need one of ${this[`${key}`].allow}`,
					errorCode: WRONG_PARAMS
				}
				return;
			}
			if (this[`${key}`].customCheck) {
				if (this[`${key}`].required && !params[`${key}`]) {
					checkResult = {
						valid: false,
						errorCode: WRONG_PARAMS,
						message: `Params key named ${key} is missing`
					}
					return;
				} else {
					const subCheckResult = this[`${key}`].customCheck(params[`${key}`], this[`${key}`]);
					if (!subCheckResult.valid) {
						checkResult = subCheckResult;
						return;
					}
				}
			}
		});

		allowedKeys.forEach(key => {
			if (this[`${key}`].required && !params[`${key}`]) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} is missing`,
					errorCode: WRONG_PARAMS
				}
			}
		});

		return checkResult;
	};


}

const composeValidators = (...validators) => (value, currentDeclaredAttribute) => {
	for (let i = 0; i < validators.length; i++) {
		const validationResult = validators[i](value, currentDeclaredAttribute);
		if (!validationResult.valid) {
			return validationResult
		}
	}
	return {
		valid: true
	};
}

Validator.composeValidators = composeValidators;

export default Validator;
import { WRONG_PARAMS } from "./error_type";

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

export default class Validator {

	constructor(params) {
		Object.keys(params).forEach(key => {
			if (!params[`${key}`].type)
				throw ('Invalid validation object, must have type for each object!');
			if (!DEFAULT_SUPPORT_TYPE.includes(params[`${key}`].type))
				throw (`Invalid validation object type, must be one of [${DEFAULT_SUPPORT_TYPE.toString()}]`);
			if (params[`${key}`].type === 'custom' && !params[`${key}`].definition)
				throw ('Invalid custom validation object, must have definition for custom type');
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

		inputKeys.forEach(key => {
			if (!allowedKeys.includes(key)) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} not exist in definition`,
					stringCode: WRONG_PARAMS
				};
				return;
			}
			if (typeof params[`${key}`] !== this[`${key}`].type && this[`${key}`].type !== 'custom') {
				checkResult = {
					valid: false,
					message: `Params key named ${key} type is incorrect, found ${typeof params[`${key}`]} need ${this[`${key}`].type}`,
					stringCode: WRONG_PARAMS
				}
			}
			if (this[`${key}`].allow && !this[`${key}`].allow.includes(params[`${key}`])) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} need one of ${this[`${key}`].allow}`,
					stringCode: WRONG_PARAMS
				}
			}
			if (this[`${key}`].customCheck && typeof this[`${key}`].customCheck === 'function') {
				if (this[`${key}`].required && !params[`${key}`]) {
					checkResult = {
						valid: false,
						stringCode: WRONG_PARAMS,
						message: `Params key named ${key} is missing`
					}
				} else {
					checkResult = this[`${key}`].customCheck(params[`${key}`]);
				}
			}
		});

		allowedKeys.forEach(key => {
			if (this[`${key}`].required && !params[`${key}`]) {
				checkResult = {
					valid: false,
					message: `Params key named ${key} is missing`,
					stringCode: WRONG_PARAMS
				}
			}
		})

		return checkResult;
	}
}
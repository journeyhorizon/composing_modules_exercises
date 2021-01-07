import Validator from ".";
import { WRONG_PARAMS } from "../error";
import { validateDate, validateDefaultDefinition } from "./validate_fnc";

//These should be in types.js
const FIXED_DISCOUNT_TYPE = 'FIXED_DISCOUNT_TYPE';
const PERCENTAGE_DISCOUNT_TYPE = 'PERCENTAGE_DISCOUNT_TYPE';
const CREDIT_TYPE = 'CREDIT_TYPE';
const CUSTOM_RULE_DISCOUNT_TYPE = 'CUSTOM_RULE_DISCOUNT_TYPE';

const SUPPORTED_DISCOUNT_TYPE = [
	FIXED_DISCOUNT_TYPE,
	PERCENTAGE_DISCOUNT_TYPE,
	CREDIT_TYPE,
	CUSTOM_RULE_DISCOUNT_TYPE
];

//This should be in validate_fnc.js
const validateRule = (options = {}) => (value) => {
	if (options.optional && !value) {
		return {
			valid: true
		};
	}

	const {
		balance,
		currency,
		percentage,
		type
	} = value;

	switch (type) {
		case PERCENTAGE_DISCOUNT_TYPE: {
			if (!percentage) {
				return {
					valid: false,
					message: WRONG_PARAMS,
					errorCode: WRONG_PARAMS
				};
			}
		}
		default: {
			if (!balance || !currency) {
				return {
					valid: false,
					message: WRONG_PARAMS,
					errorCode: WRONG_PARAMS
				};
			}
		}
	}
	return {
		valid: true
	};
}

const examples = () => {
	const ParamsValidator = new Validator({
		id: {
			type: 'string',
		},
		attributes: {
			type: 'custom',
			required: true,
			customCheck: validateDefaultDefinition(),
			definition: {
				name: {
					type: 'string',
					required: true
				},
				rule: {
					definition: {
						balance: {
							type: 'number',
						},
						currency: {
							type: 'string',
						},
						percentage: {
							type: 'number',
						},
						type: {
							type: 'string',
							allow: SUPPORTED_DISCOUNT_TYPE
						},
					},
					type: 'custom',
					required: true,
					customCheck: Validator.composeValidators(
						validateDefaultDefinition(),
						validateRule())
				},
				attachLimit: {
					type: 'number',
				},
				useLimit: {
					//We only need to indicate use limit when this is a unique code
					//Use limit mean the time a person can re-use the unique code
					type: 'number',
				},
				redemptionRules: {
					type: 'string',
				},
				start: {
					type: 'custom',
					customCheck: validateDate
				},
				end: {
					type: 'custom',
					customCheck: validateDate
				},
				active: {
					type: 'boolean'
				},
				publicData: {
					type: 'custom',
					customCheck: () => {
						return {
							valid: true
						};
					}
				},
				protectedData: {
					type: 'custom',
					customCheck: () => {
						return {
							valid: true
						};
					}
				},
				privateData: {
					type: 'custom',
					customCheck: () => {
						return {
							valid: true
						};
					}
				},
			}
		}
	});

	const params = {
		id: 'Test',
		attributes: {
			name: "Test",
			rule: {
				type: PERCENTAGE_DISCOUNT_TYPE,
				percentage: 0.3
			}
		}
	};

	const validateResult = ParamsValidator.validate(params);

	if (!validateResult.valid) {
		console.log({
			code: 400,
			data: {
				message: validateResult.message,
				errorCode: validateResult.errorCode
			}
		});
	} else {
		console.log(params);
	}
};
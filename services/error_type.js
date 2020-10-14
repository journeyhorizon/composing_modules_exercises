export const WRONG_PARAMS = 'WRONG_PARAMS';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const LISTING_NOT_FOUND = 'LISTING_NOT_FOUND';
export const BAD_REQUEST = 'BAD_REQUEST';
export const FETCHING_USER_DATA_FAILED = 'FETCHING_USER_DATA_FAILED';
export const SERVER_FAILED_UNEXPECTEDLY = 'SERVER_FAILED_UNEXPECTEDLY';
export const EVENT_NOT_FOUND = 'EVENT_NOT_FOUND';
export const EVENT_ERROR_TYPE = 'EVENT_ERROR_TYPE';
export const NOT_PROVIDER = 'NOT_PROVIDER';
export const HAVE_NOT_CONNECTED_STRIPE_ACCOUNT = 'HAVE_NOT_CONNECTED_STRIPE_ACCOUNT';
export const LISTING_DOES_NOT_HAVE_PRICE = 'LISTING_DOES_NOT_HAVE_PRICE';
export const NOT_ALLOWED_TO_CREATE_PAYOUT = 'NOT_ALLOWED_TO_CREATE_PAYOUT';
export const NOT_ALLOWED_TO_CREATE_REFUND = 'NOT_ALLOWED_TO_CREATE_REFUND';
export const NOT_ALLOWED_TO_CANCEL_SUBSCRIPTION = 'NOT_ALLOWED_TO_CANCEL_SUBSCRIPTION';
export const NO_TOKEN_FOUND = 'NO_TOKEN_FOUND';
export const INVALID_TOKEN = 'INVALID_TOKEN';

export const getMissingErrorStringCode = type => ({
  EVENT_ERROR_TYPE: EVENT_NOT_FOUND
})[type];
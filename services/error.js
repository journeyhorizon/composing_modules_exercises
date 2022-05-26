import { types as sdkTypes } from 'sharetribe-flex-integration-sdk';

const { UUID } = sdkTypes;
const CUSTOM_ERROR_ID = 'jh-custom-error-id';

//Common
export const WRONG_PARAMS = 'WRONG_PARAMS';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const LISTING_NOT_FOUND = 'LISTING_NOT_FOUND';
export const BAD_REQUEST = 'BAD_REQUEST';
export const FETCHING_USER_DATA_FAILED = 'FETCHING_USER_DATA_FAILED';
export const SERVER_FAILED_UNEXPECTEDLY = 'SERVER_FAILED_UNEXPECTEDLY';
export const EVENT_NOT_FOUND = 'EVENT_NOT_FOUND';
export const EVENT_ERROR = 'EVENT_ERROR';
export const NOT_PROVIDER = 'NOT_PROVIDER';
export const HAVE_NOT_CONNECTED_STRIPE_ACCOUNT = 'HAVE_NOT_CONNECTED_STRIPE_ACCOUNT';
export const LISTING_DOES_NOT_HAVE_PRICE = 'LISTING_DOES_NOT_HAVE_PRICE';
export const NO_TOKEN_FOUND = 'NO_TOKEN_FOUND';
export const INVALID_TOKEN = 'INVALID_TOKEN';
export const EMPTY_ARRAY_ERROR = 'EMPTY_ARRAY_ERROR';
export const WRONG_ARRAY_TYPE_ERROR = 'WRONG_ARRAY_TYPE_ERROR';
export const INVALID_EMAIL_ERROR = 'INVALID_EMAIL_ERROR';
export const INVALID_ROLE_ERROR = 'INVALID_ROLE_ERROR';

//transactions
export const INVALID_TRANSITION_ERROR = 'transaction-invalid-transition';

// Subscription
export const NO_PAYMENT_METHOD_ERROR = 'NO_PAYMENT_METHOD_ERROR';
export const SUBSCRIPTION_ALREADY_EXIST_ERROR = 'SUBSCRIPTION_ALREADY_EXIST_ERROR';
export const SUBSCRIPTION_ALREADY_CANCELED_ERROR = 'SUBSCRIPTION_ALREADY_CANCELED_ERROR';
export const UNKNOWN_SUBSCRIPTION_PRICING_ERROR = 'UNKNOWN_SUBSCRIPTION_PRICING_ERROR';
export const SUBSCRIPTION_NOT_FOUND_ERROR = 'SUBSCRIPTION_NOT_FOUND_ERROR';
export const LISTING_TYPE_IS_NOT_SUBSCRIPTION = 'LISTING_TYPE_IS_NOT_SUBSCRIPTION';
export const TRANSACTION_TYPE_IS_NOT_SUBSCRIPTION = 'TRANSACTION_TYPE_IS_NOT_SUBSCRIPTION';

//Stripe error
export const STRIPE_INVALID_REQUEST_ERROR = "StripeInvalidRequestError";

export const createFlexErrorObject = ({
  message,
  messageCode,
  status
}) => {
  return {
    errors: [
      {
        id: new UUID(CUSTOM_ERROR_ID),
        status,
        title: message,
        messageCode,
        code: messageCode
      }
    ]
  }
}
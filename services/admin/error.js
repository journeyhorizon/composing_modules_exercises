import { types as sdkTypes } from '../sharetribe/index';

const { UUID } = sdkTypes;
const CUSTOM_ERROR_ID = 'jh-custom-error-id';

export const PAGE_EXISTED_ERROR = 'PAGE_EXISTED_ERROR';
export const ALREADY_IN_PAGE_ERROR = 'ALREADY_IN_PAGE_ERROR';
export const IS_PAGE_EMAIL_ERROR = 'IS_PAGE_EMAIL_ERROR';

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
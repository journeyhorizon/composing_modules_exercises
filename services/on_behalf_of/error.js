import { types as sdkTypes } from '../sharetribe/index';

const { UUID } = sdkTypes;
const CUSTOM_ERROR_ID = 'jh-custom-error-id';

export const PAGE_EXISTED_ERROR = 'PAGE_EXISTED_ERROR';

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
        messageCode
      }
    ]
  }
}
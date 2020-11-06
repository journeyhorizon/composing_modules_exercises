import config from "./config";
import { send as handleSendingSMS } from "./notification/sms";
import { getTransaction } from "./sharetribe_admin";
import {
  TRANSITION_ACCEPT,
  TRANSITION_ACCEPT_OFFER_CASH_PAYMENT,
  TRANSITION_CASH_ACCEPT,
  TRANSITION_CASH_DECLINE,
  TRANSITION_CASH_REQUEST_PAYMENT,
  TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY,
  TRANSITION_CONFIRM_PAYMENT,
  TRANSITION_CONFIRM_PAYMENT_OFFER,
  TRANSITION_DECLINE,
  TRANSITION_DECLINE_OFFER,
  TRANSITION_SEND_NEW_OFFER,
  TRANSITION_SEND_OFFER
} from "./transactions/processes";

export const TEAM_MEMBER_INVITE = 'TEAM_MEMBER_INVITE';
export const MESSAGE_SENT = 'MESSAGE_SENT';
export const ACCEPT_OFFER_PROVIDER = 'ACCEPT_OFFER_PROVIDER';
export const ACCEPT_OFFER_CUSTOMER = 'ACCEPT_OFFER_CUSTOMER';

export const handleEvents = params => {
  const { type, ...data } = params;
  switch (type) {
  }
  return {
    code: 200,
    data: {
      message: 'Signal received'
    }
  }
}

const getListOfSMSData = ({
  transaction,
  action,
  metadata = {}
}) => {

  const defaultData = {
    pageName: transaction.listing.attributes.title,
    marketplaceName: config.sharetribeFlex.marketplaceName,
    customerName: transaction.customer.attributes.profile.displayName,
  };

  const createProviderSMSParams = (type = null) => {
    const providerPhoneNumbers = transaction.listing.attributes.publicData.phoneNumber;

    if (!providerPhoneNumbers || providerPhoneNumbers.length < 1) {
      console.error(`Provider ${transaction.provider.id.uuid} missing phone number`);
      return;
    }

    return [{
      data: {
        ...defaultData
      },
      receivedNumbers: providerPhoneNumbers.map(phoneNumberObj => phoneNumberObj.phoneNumber),
      type: type || action
    }];
  }

  const createCustomerSMSParams = (type = null) => {
    const customerPhoneNumber = transaction.customer.attributes.profile.protectedData.phoneNumber;

    if (!customerPhoneNumber ||
      typeof customerPhoneNumber !== 'string' ||
      !customerPhoneNumber.includes('+')) {
      console.error(`Customer ${transaction.customer.id.uuid} missing phone number`);
      return;
    }

    return [{
      data: {
        ...defaultData
      },
      receivedNumbers: [customerPhoneNumber],
      type: type || action
    }];
  }

  switch (action) {
    case TRANSITION_CONFIRM_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY:
    case TRANSITION_DECLINE_OFFER: {
      return createProviderSMSParams();
    }
    case TRANSITION_SEND_OFFER:
    case TRANSITION_SEND_NEW_OFFER:
    case TRANSITION_ACCEPT:
    case TRANSITION_CASH_ACCEPT:
    case TRANSITION_CASH_DECLINE:
    case TRANSITION_DECLINE: {
      return createCustomerSMSParams();
    }
    case TRANSITION_CONFIRM_PAYMENT_OFFER:
    case TRANSITION_ACCEPT_OFFER_CASH_PAYMENT: {
      return [
        ...createCustomerSMSParams(ACCEPT_OFFER_CUSTOMER),
        ...createProviderSMSParams(ACCEPT_OFFER_PROVIDER)
      ];
    }
    case MESSAGE_SENT: {
      const {
        senderId
      } = metadata;
      const isCustomer = transaction.customer.id.uuid === senderId;

      if (isCustomer) {
        const params = createCustomerSMSParams();
        params.customerName = null;
        return params;
      } else {
        const params = createProviderSMSParams();
        params.pageName = null;
        return params;
      }
    }
    default: {
      console.log(`Unhandled event ${action}`);
      return [];
    }
  }
}

export const handleUserActionEvent = async ({
  id,
  action,
  metadata
}) => {
  const transaction = await getTransaction({
    transactionId: typeof id === 'string'
      ? id
      : id.uuid
    , include: ['listing', 'provider', 'customer']
  });

  const listOfSMSData = getListOfSMSData({
    action,
    transaction,
    metadata
  });

  await Promise.all(listOfSMSData.map(({
    receivedNumbers,
    data,
    type
  }) => {
    return handleSendingSMS({
      data,
      receivedNumbers,
      type
    });
  }));

  return {
    code: 200,
    data: {
      message: 'received'
    }
  };
}
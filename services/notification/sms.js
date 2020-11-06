import config from '../config';
import twilio from 'twilio';
import {
  ACCEPT_OFFER_CUSTOMER,
  ACCEPT_OFFER_PROVIDER,
  MESSAGE_SENT
} from '../event';
import {
  TRANSITION_ACCEPT,
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
} from '../transactions/processes';
import fs from 'fs';

const SMSClient = config.sms.accountSid
  ? new twilio(config.sms.accountSid, config.sms.authToken)
  : null;

const getTextContent = (type) => {
  switch (type) {
    case TRANSITION_CONFIRM_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY:
      return fs.readFileSync('templates/sms/TRANSITION_REQUEST_PAYMENT.txt', "utf8");
    case TRANSITION_DECLINE_OFFER:
      return fs.readFileSync('templates/sms/TRANSITION_DECLINE_OFFER.txt', "utf8");
    case TRANSITION_SEND_OFFER:
    case TRANSITION_SEND_NEW_OFFER:
      return fs.readFileSync('templates/sms/TRANSITION_SEND_OFFER.txt', "utf8");
    case ACCEPT_OFFER_CUSTOMER:
      return fs.readFileSync('templates/sms/ACCEPT_OFFER_CUSTOMER.txt', "utf8");
    case ACCEPT_OFFER_PROVIDER:
      return fs.readFileSync('templates/sms/ACCEPT_OFFER_PROVIDER.txt', "utf8");
    case TRANSITION_ACCEPT:
    case TRANSITION_CASH_ACCEPT:
      return fs.readFileSync('templates/sms/TRANSITION_ACCEPT.txt', "utf8");
    case TRANSITION_CASH_DECLINE:
    case TRANSITION_DECLINE:
      return fs.readFileSync('templates/sms/TRANSITION_DECLINE.txt', "utf8");
    case MESSAGE_SENT:
      return fs.readFileSync('templates/sms/MESSAGE_SENT.txt', "utf8");
    default:
      break;
  }
}

const getSMSContent = (type, data = null) => {
  switch (type) {
    case TRANSITION_CONFIRM_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT:
    case TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY:
      return getTextContent(TRANSITION_CONFIRM_PAYMENT)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case TRANSITION_DECLINE_OFFER:
      return getTextContent(TRANSITION_DECLINE_OFFER)
        .split("REPLACE_CUSTOMER_NAME").join(data.customerName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case TRANSITION_SEND_OFFER:
    case TRANSITION_SEND_NEW_OFFER:
      return getTextContent(TRANSITION_SEND_OFFER)
        .split("REPLACE_CUSTOMER_NAME").join(data.customerName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case ACCEPT_OFFER_CUSTOMER:
      return getTextContent(ACCEPT_OFFER_CUSTOMER)
        .split("REPLACE_CUSTOMER_NAME").join(data.customerName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case ACCEPT_OFFER_PROVIDER:
      return getTextContent(ACCEPT_OFFER_PROVIDER)
        .split("REPLACE_CUSTOMER_NAME").join(data.customerName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case TRANSITION_ACCEPT:
    case TRANSITION_CASH_ACCEPT:
      return getTextContent(TRANSITION_ACCEPT)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
    case TRANSITION_DECLINE:
    case TRANSITION_CASH_DECLINE:
      return getTextContent(TRANSITION_DECLINE)
        .split("REPLACE_CUSTOMER_NAME").join(data.customerName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName);
    case MESSAGE_SENT:
      return getTextContent(MESSAGE_SENT)
        .split("REPLACE_SENDER_NAME").join(data.customerName || data.pageName)
    default:
      break;
  }
};

const createSMSParams = ({
  content,
  hostNumber = config.sms.hostedNumber,
  receivedNumber
}) => {
  return {
    body: content,
    to: receivedNumber,
    from: hostNumber
  }
};

const sendSMS = params => {
  if (!SMSClient) {
    throw (new Error(`SMS client need to be initiated first`));
  }
  return SMSClient.messages.create(params);
}

export const send = ({
  data,
  receivedNumbers,
  hostNumber: inputHostNumber,
  type
}) => {
  const hostNumber = inputHostNumber
    ? inputHostNumber
    : config.sms.hostedNumber;
  const content = config.nodeEnv === 'production'
    ? getSMSContent(type, data)
    : `[TEST] ${getSMSContent(type, data)}`;
  const paramsMap = receivedNumbers.map(receivedNumber =>
    createSMSParams({
      content,
      receivedNumber,
      hostNumber
    }));

  paramsMap.forEach(params => {
    return sendSMS(params)
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      });
  })


};

import config from '../config';
import twilio from 'twilio';
import { TEAM_MEMBER_INVITE } from '../event';

const SMSClient = config.sms.accountSid
  ? new twilio(config.sms.accountSid, config.sms.authToken)
  : null;

const getTextContent = (type) => {
  switch (type) {
    case TEAM_MEMBER_INVITE:
      return fs.readFileSync('templates/sms/TEAM_MEMBER_INVITE.txt', "utf8");
    default:
      break;
  }
}

const getSMSContent = (type, data = null) => {
  switch (type) {
    case TEAM_MEMBER_INVITE:
      return getTextContent(TEAM_MEMBER_INVITE)
        .split("REPLACE_FIRST_NAME").join(data.firstName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName)
        .split("REPLACE_VERIFICATION_LINK").join(data.verificationLink);
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
  receivedNumber,
  hostNumber
}) => {
  const content = config.nodeEnv === 'production'
    ? getSMSContent(TYPE, data)
    : `[TEST] ${getSMSContent(TYPE, data)}`;
  const params = createSMSParams({
    content,
    receivedNumber,
    hostNumber
  });

  switch (TYPE) {
    case TEAM_MEMBER_INVITE:
      sendSMS(params)
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err);
        });
      break;
    default:
      break;
  }

};

import config from './config';
import { TEAM_MEMBER_INVITE } from './event';

const fs = require('fs');
const AWS = require('aws-sdk');

const ADMIN_EMAIL = config.email.senderAddress;

AWS.config.update({ region: config.aws.ses.region });

const NEED_CALL_BACK = 'NEED_CALL_BACK';
const NEED_NO_CALL_BACK = 'NEED_NO_CALL_BACK';

const getHtmlContent = (type) => {
  switch (type) {
    case TEAM_MEMBER_INVITE:
      return fs.readFileSync('email_templates/TEAM_MEMBER_INVITE.html', "utf8");
    default:
      break;
  }
}

const getEmailContent = (type, data = null) => {
  switch (type) {
    case TEAM_MEMBER_INVITE:
      return getHtmlContent(TEAM_MEMBER_INVITE)
        .split("REPLACE_FIRST_NAME").join(data.firstName)
        .split("REPLACE_PAGE_NAME").join(data.pageName)
        .split("REPLACE_MARKETPLACE_NAME").join(data.marketplaceName)
        .split("REPLACE_VERIFICATION_LINK").join(data.verificationLink);
    default:
      break;
  }
};

const getEmailSubject = (type, data = null) => {
  switch (type) {
    case TEAM_MEMBER_INVITE:
      return `You have been invited to ${data.pageName} on ${data.marketplaceName}`;
    default:
      break;
  }
};

const createEmailParams = (receiver, subject, content, isTemplated = false, data = null) => {
  let toAddresses = Array.isArray(receiver) ? receiver : [receiver];
  let body = isTemplated ? null : {
    Html: {
      Charset: "UTF-8",
      Data: `${content}`
    }
  };
  return {
    Destination: {
      ToAddresses: toAddresses
    },
    Message: {
      Body: body,
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: ADMIN_EMAIL,
  };
};

const sendEmail = params => {
  return new AWS.SES({ apiVersion: '2010-12-01' })
    .sendEmail(params)
    .promise();
}

export const send = (receiver, TYPE, data = null, callback = null) => {
  // Create sendTemplatedEmail params
  // Create sendEmail params
  const subject = config.nodeEnv === 'production'
    ? getEmailSubject(TYPE, data)
    : "[TEST] " + getEmailSubject(TYPE, data);
  const content = getEmailContent(TYPE, data);
  const params = createEmailParams(receiver, subject, content, false, data);

  switch (TYPE) {
    case NEED_CALL_BACK:
      sendEmail(params)
        .then((data) => {
          console.log(data);
          callback();
        })
        .catch((err) => {
          console.error(err, err.stack);
        });
      break;
    case NEED_NO_CALL_BACK:
    case TEAM_MEMBER_INVITE:
      sendEmail(params)
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.error(err, err.stack);
        });
      break;
    default:
      break;
  }

};

import { sendNotifyEmails } from "./send_notify_emails";
import { composePromises } from "../../../../../utils";
import { generateEmailParams } from "./generate_email_params";

export const processNewPeriod = async (params) => {
  return composePromises(
    generateEmailParams,
    sendNotifyEmails
  )(params);
};
import { sendEmail } from "../../../../../sendgrid/sendEmail";

/* Send notification emails for a new period of the subscription */
export const sendNotifyEmails = async ({ customerEmailParams, providerEmailParams }) => {
  await Promise.all([
    sendEmail(customerEmailParams), 
    sendEmail(providerEmailParams)
  ]);
}
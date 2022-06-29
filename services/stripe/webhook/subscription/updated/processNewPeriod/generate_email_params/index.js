import { generateProviderEmailParams } from "./generate_provider_email_params.js";
import { generateCustomerEmailParams } from "./generate_customer_email_params";
import { getTransaction } from "../../../../../../sharetribe_admin";

const createReceiverParams = ({ toName, toEmail, html, subject }) => ({
  personalizations: [{
    to: [{ name: toName, email: toEmail }]
  }],
  subject,
  content: [{
    type: 'text/html',
    value: html
  }]
});

export const generateEmailParams = async ({ transactionId }) => {
  const transaction = await getTransaction({ transactionId, include: ['listing', 'customer', 'provider'] });
  const providerParams = generateProviderEmailParams({ transaction });
  const customerParams = generateCustomerEmailParams({ transaction });

  const providerEmailParams = createReceiverParams(providerParams);
  const customerEmailParams = createReceiverParams(customerParams);

  return {
    customerEmailParams,
    providerEmailParams
  }
}
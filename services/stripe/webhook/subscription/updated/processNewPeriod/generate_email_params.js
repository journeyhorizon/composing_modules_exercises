import { getTransaction } from "../../../../../sharetribe_admin"
import { getTextFileContent, convertToMonetaryUnit } from "../../../../../utils";
import config from "../../../../../config";

const createParams = (name, email, html, subject) => ({
  personalizations: [{
    to: [{ name, email }]
  }],
  subject,
  content: [{
    type: 'text/html',
    value: html
  }]
});

export const generateEmailParams = async ({ providerEmail, providerName, customerEmail, customerName, transactionId }) => {
  const transaction = await getTransaction({ transactionId, include: ['listing'] });

  const { attributes: { payinTotal, payoutTotal, lineItems }, listing } = transaction;
  const { title: listingTitle } = listing.attributes;
  const unitPriceLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/units');
  const customerCommissionLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/customer-commission');
  const providerCommissionLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/provider-commission');
  const unitPrice = convertToMonetaryUnit(unitPriceLineItem.unitPrice.amount);
  const customerCommissionFee = convertToMonetaryUnit(customerCommissionLineItem.lineTotal.amount);
  const providerCommissionFee = convertToMonetaryUnit(providerCommissionLineItem.lineTotal.amount);
  const payinTotalAmount = convertToMonetaryUnit(payinTotal.amount);
  const payoutTotalAmount = convertToMonetaryUnit(payoutTotal.amount);
  const baseCurrency = payinTotal.currency || config.currencyConfig.baseCurrency;

  const customerEmailSubject = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-customer-subject.txt')
    .replace('LISTING_TITLE', listingTitle);

  const customerEmailHtml = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-customer.html')
    .replaceAll('LISTING_TITLE', listingTitle)
    .replaceAll('PROVIDER_DISPLAY_NAME', providerName)
    .replaceAll('PAYIN_TOTAL', `${payinTotalAmount} ${baseCurrency}`)
    .replaceAll('UNIT_PRICE', `${unitPrice} ${baseCurrency}`)
    .replaceAll('CUSTOMER_COMMISSION_FEE', `${customerCommissionFee} ${baseCurrency}`);

  const providerEmailSubject = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-provider-subject.txt')
    .replace('CUSTOMER_DISPLAY_NAME', customerName);

  const providerEmailHtml = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-provider.html')
    .replaceAll('LISTING_TITLE', listingTitle)
    .replaceAll('CUSTOMER_DISPLAY_NAME', customerName)
    .replaceAll('PAYOUT_TOTAL', `${payoutTotalAmount} ${baseCurrency}`)
    .replaceAll('UNIT_PRICE', `${unitPrice} ${baseCurrency}`)
    .replaceAll('PROVIDER_COMMISSION_FEE', `${providerCommissionFee} ${baseCurrency}`);

  const customerEmailParams = 
    createParams(
      customerName, 
      customerEmail,
      customerEmailHtml,
      customerEmailSubject
    );

  const providerEmailParams = 
    createParams(
      providerName, 
      providerEmail,
      providerEmailHtml,
      providerEmailSubject
    );

  return {
    customerEmailParams,
    providerEmailParams
  }
}
import { convertToMonetaryUnit, getTextFileContent } from "../../../../../../utils";
import config from "../../../../../../config";

export const generateCustomerEmailParams = ({ transaction }) => {
  const { webCanonicalUrl, currencyConfig } = config;
  const { attributes: { payinTotal, lineItems }, listing, customer, provider, id: txId } = transaction;
  const { title: listingTitle } = listing.attributes;
  const { email: customerEmail, profile: { displayName: customerName } } = customer.attributes;
  const { profile: { displayName: providerName } } = provider.attributes;
  const unitPriceLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/units');
  const customerCommissionLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/customer-commission');
  const unitPrice = convertToMonetaryUnit(unitPriceLineItem.unitPrice.amount);
  const customerCommissionFee = convertToMonetaryUnit(customerCommissionLineItem.lineTotal.amount);
  const payinTotalAmount = convertToMonetaryUnit(payinTotal.amount);
  const baseCurrency = payinTotal.currency || currencyConfig.baseCurrency;
  const orderTxUrl = `${webCanonicalUrl}/order/${txId.uuid}/details`
  
  const subject = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-customer-subject.txt')
    .replace('LISTING_TITLE', listingTitle);

  const html = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-customer.html')
    .replaceAll('LISTING_TITLE', listingTitle)
    .replaceAll('PROVIDER_DISPLAY_NAME', providerName)
    .replaceAll('PAYIN_TOTAL', `${payinTotalAmount} ${baseCurrency}`)
    .replaceAll('UNIT_PRICE', `${unitPrice} ${baseCurrency}`)
    .replaceAll('CUSTOMER_COMMISSION_FEE', `${customerCommissionFee} ${baseCurrency}`);

  return {
    toName: customerName,
    toEmail: customerEmail,
    subject,
    html
  }
}
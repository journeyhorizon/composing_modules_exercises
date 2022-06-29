import { getTextFileContent, convertToMonetaryUnit } from "../../../../../../utils";
import config from "../../../../../../config";

export const generateProviderEmailParams = ({ transaction }) => {
  const { attributes: { payoutTotal, lineItems }, listing, provider, customer } = transaction;
  const { title: listingTitle } = listing.attributes;
  const { email: providerEmail, profile: { displayName: providerName } } = provider.attributes;
  const { profile: { displayName: customerName } } = customer.attributes;
  const unitPriceLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/units');
  const providerCommissionLineItem = lineItems.find(lineItem => lineItem.code === 'line-item/provider-commission');
  const unitPrice = convertToMonetaryUnit(unitPriceLineItem.unitPrice.amount);
  const providerCommissionFee = convertToMonetaryUnit(providerCommissionLineItem.lineTotal.amount);
  const payoutTotalAmount = convertToMonetaryUnit(payoutTotal.amount);
  const baseCurrency = payoutTotal.currency || config.currencyConfig.baseCurrency;
  
  const subject = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-provider-subject.txt')
    .replace('CUSTOMER_DISPLAY_NAME', customerName);

  const html = 
    getTextFileContent('email-templates/subscription/new-month-payment/new-month-payment-to-provider.html')
    .replaceAll('LISTING_TITLE', listingTitle)
    .replaceAll('CUSTOMER_DISPLAY_NAME', customerName)
    .replaceAll('PAYOUT_TOTAL', `${payoutTotalAmount} ${baseCurrency}`)
    .replaceAll('UNIT_PRICE', `${unitPrice} ${baseCurrency}`)
    .replaceAll('PROVIDER_COMMISSION_FEE', `${providerCommissionFee} ${baseCurrency}`);

  return {
    toName: providerName,
    toEmail: providerEmail,
    subject,
    html
  }
}
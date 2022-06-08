const COMMON_IGNORE_INVOICE_MESSAGE = 'Message received, this invoice does not need update';

const checkInvoice = async (invoice) => {
  const subscriptionId = invoice.subscription || invoice.metadata.subscriptionId;
  if (!subscriptionId) {
    throw ({
      code: 200,
      data: COMMON_IGNORE_INVOICE_MESSAGE
    })
  }
  return subscriptionId;
}

export default checkInvoice;
const COMMON_IGNORE_INVOICE_MESSAGE = 'Message received, this invoice does not need update';

const checkSubscriptionInvoiceNeedUpdate = async ({
  invoice,
  subscription,
  customerPaymentMethod
}) => {
  const {
    total,
    status,
    subscription: subscriptionId
  } = invoice;

  if (!subscriptionId ||
    total === 0 ||
    status === 'paid') {
    throw ({
      code: 200,
      data: COMMON_IGNORE_INVOICE_MESSAGE
    });
  }
  const {
    metadata: {
      needUpdateOnBehalfOf,
    } = {}
  } = subscription;

  if (needUpdateOnBehalfOf !== 'true') {
    throw ({
      code: 200,
      data: COMMON_IGNORE_INVOICE_MESSAGE
    });
  }

  return {
    invoice,
    subscription,
    customerPaymentMethod
  };
}

export default checkSubscriptionInvoiceNeedUpdate;
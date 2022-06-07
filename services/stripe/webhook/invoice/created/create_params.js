const createSubscriptionInvoiceUpdateParams = async ({
  invoice,
  subscription
}) => {
  const {
    metadata: {
      applicationFeePercent,
      stripeDestination,
    } = {}
  } = subscription;

  const params = {
    on_behalf_of: stripeDestination,
    transfer_data: {
      destination: stripeDestination,
    },
  };

  if (applicationFeePercent) {
    const { total } = invoice;
    const percentage = parseFloat(applicationFeePercent);
    params.application_fee_amount = parseInt(total / 100 * percentage, 10);
  }

  return params;
}

export default createSubscriptionInvoiceUpdateParams;
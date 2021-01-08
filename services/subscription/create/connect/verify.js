import { createFlexErrorObject, HAVE_NOT_CONNECTED_STRIPE_ACCOUNT } from '../../../error';
import checkCustomerRequirement from '../verify';

const checkSubscriptionRequirement = async ({ customer, provider }) => {
  checkCustomerRequirement(customer);

  const { stripeAccount } = provider;

  if (!stripeAccount ||
    !provider.attributes.stripeConnected) {
    throw ({
      code: 404,
      data: createFlexErrorObject({
        status: 404,
        message: HAVE_NOT_CONNECTED_STRIPE_ACCOUNT,
        messageCode: HAVE_NOT_CONNECTED_STRIPE_ACCOUNT
      })
    });
  }

  return {
    customer,
    provider
  };
}

export default checkSubscriptionRequirement;
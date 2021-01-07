import {
  NO_PAYMENT_METHOD_ERROR
} from "../../error";
import { createFlexErrorObject } from "../../error";

const checkSubscriptionRequirement = async (customer) => {
  const { stripeCustomer } = customer;

  if (!stripeCustomer ||
    !stripeCustomer.invoiceSettings ||
    !stripeCustomer.invoiceSettings.defaultPaymentMethod) {
    throw ({
      code: 404,
      data: createFlexErrorObject({
        status: 404,
        message: NO_PAYMENT_METHOD_ERROR,
        messageCode: NO_PAYMENT_METHOD_ERROR
      })
    });
  }

  return customer;
}

export default checkSubscriptionRequirement;
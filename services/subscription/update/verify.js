import {
  NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  NO_PAYMENT_METHOD_ERROR,
  SUBSCRIPTION_NOT_FOUND_ERROR,
  SUBSCRIPTION_ALREADY_CANCELED_ERROR,
  NEW_PORT_QUANTITY_IS_SMALLER_THAN_CURRENT_ACTIVE_PORT_ERROR,
} from "../../error_type";
import { createFlexErrorObject } from "../../on_behalf_of/error";
import {
  SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE,
  SUBSCRIPTION_CANCELLED_STATE,
} from "../types";

const verifyCompanyCanUpdateSubscription = ({
  company,
  lineItems
}) => {
  const { metadata } = company.attributes.profile;
  const {
    subscription
  } = metadata;

  const { stripeCustomer } = company;

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

  if (!subscription || !subscription.id) {
    throw ({
      code: 404,
      data: createFlexErrorObject({
        status: 404,
        message: SUBSCRIPTION_NOT_FOUND_ERROR,
        messageCode: SUBSCRIPTION_NOT_FOUND_ERROR
      })
    });
  }

  switch (subscription.status) {
    case SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE:
    case SUBSCRIPTION_CANCELLED_STATE:
      throw ({
        code: 403,
        data: createFlexErrorObject({
          status: 403,
          message: SUBSCRIPTION_ALREADY_CANCELED_ERROR,
          messageCode: SUBSCRIPTION_ALREADY_CANCELED_ERROR
        })
      });
    default: {
      break;
    }
  }

  const newPortQuantity = lineItems.reduce((quantity, lineItem) => {
    if (!quantity) {
      return lineItem.quantity;
    }
    if (quantity < lineItem.quantity) {
      return lineItem.quantity;
    }
    return quantity;
  }, 0);

  const {
    activePorts = 0
  } = subscription;

  if (activePorts > newPortQuantity) {
    throw ({
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: NEW_PORT_QUANTITY_IS_SMALLER_THAN_CURRENT_ACTIVE_PORT_ERROR,
        messageCode: NEW_PORT_QUANTITY_IS_SMALLER_THAN_CURRENT_ACTIVE_PORT_ERROR
      })
    });
  }

  return { valid: true };
}


const checkSubscriptionRequirement = fnParams => async (customer) => {
  const { lineItems } = fnParams.params;
  const { publicData } = customer.attributes.profile;
  const {
    teamMemberIds
  } = publicData;
  const isCompanyAccount = !!teamMemberIds;
  if (isCompanyAccount) {
    verifyCompanyCanUpdateSubscription({
      company: customer,
      lineItems
    });
  } else {
    throw ({
      code: 400,
      data: createFlexErrorObject({
        status: 400,
        message: NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
        messageCode: NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR
      })
    });
  }
  return customer;
}

export default checkSubscriptionRequirement;
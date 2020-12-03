import {
  SUBSCRIPTION_ALREADY_EXIST_ERROR,
  NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  NO_PAYMENT_METHOD_ERROR
} from "../../error_type";
import { createFlexErrorObject } from "../../on_behalf_of/error";
import {
  SUBSCRIPTION_TRIAL_STATE,
  SUBSCRIPTION_ACTIVE_STATE,
  SUBSCRIPTION_PAST_DUE_STATE,
  SUBSCRIPTION_UNPAID_STATE,
  SUBSCRIPTION_INCOMPLETE_STATE,
} from "../types";

const verifyCompanyCanStartNewSubscription = company => {
  const { metadata } = company.attributes.profile;
  const {
    subscription
  } = metadata;

  const { stripeCustomer } = company;

  // if (!stripeCustomer ||
  //   !stripeCustomer.invoiceSettings ||
  //   !stripeCustomer.invoiceSettings.defaultPaymentMethod) {
  //   throw ({
  //     code: 404,
  //     data: createFlexErrorObject({
  //       status: 404,
  //       message: NO_PAYMENT_METHOD_ERROR,
  //       messageCode: NO_PAYMENT_METHOD_ERROR
  //     })
  //   });
  // }

  if (!subscription) {
    return { valid: true };
  }

  switch (subscription.status) {
    case SUBSCRIPTION_TRIAL_STATE:
    case SUBSCRIPTION_ACTIVE_STATE:
    case SUBSCRIPTION_PAST_DUE_STATE:
    case SUBSCRIPTION_INCOMPLETE_STATE:
    case SUBSCRIPTION_UNPAID_STATE:
      throw ({
        code: 409,
        data: createFlexErrorObject({
          status: 409,
          message: SUBSCRIPTION_ALREADY_EXIST_ERROR,
          messageCode: SUBSCRIPTION_ALREADY_EXIST_ERROR
        })
      });
    default: {
      break;
    }
  }

  return { valid: true };
}


const checkSubscriptionRequirement = async (customer) => {
  // const { publicData } = customer.attributes.profile;
  // const {
  //   teamMemberIds
  // } = publicData;
  // const isCompanyAccount = !!teamMemberIds;
  // if (isCompanyAccount) {
  verifyCompanyCanStartNewSubscription(customer);
  // } else {
  //   throw ({
  //     code: 400,
  //     data: createFlexErrorObject({
  //       status: 400,
  //       message: NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  //       messageCode: NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR
  //     })
  //   });
  // }
  return customer;
}

export default checkSubscriptionRequirement;
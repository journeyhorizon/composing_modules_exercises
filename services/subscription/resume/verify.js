import {
  NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  NO_PAYMENT_METHOD_ERROR,
  SUBSCRIPTION_NOT_FOUND_ERROR,
  SUBSCRIPTION_ALREADY_CANCELED_ERROR,
} from "../../error";
import { createFlexErrorObject } from "../../error";
import {
  SUBSCRIPTION_INCOMPLETE_EXPIRED_STATE,
  SUBSCRIPTION_CANCELLED_STATE,
} from "../types";

const verifyCompanyCanUpdateSubscription = company => {
  const { metadata } = company.attributes.profile;
  const {
    subscription
  } = metadata;

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

  return { valid: true };
}


const checkSubscriptionRequirement = async (customer) => {
  const { publicData } = customer.attributes.profile;
  const {
    teamMemberIds
  } = publicData;
  const isCompanyAccount = !!teamMemberIds;
  if (isCompanyAccount) {
    verifyCompanyCanUpdateSubscription(customer);
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
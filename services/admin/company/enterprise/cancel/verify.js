import {
  NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  SUBSCRIPTION_ALREADY_CANCELED_ERROR,
  SUBSCRIPTION_NOT_FOUND_ERROR,
  WRONG_SUBSCRIPTION_TYPE_ERROR,
} from "../../../../error_type";
import { createFlexErrorObject } from "../../../../on_behalf_of/error";
import {
  OCEAN_PLAN,
  SUBSCRIPTION_CANCELLED_STATE,
} from "../../../../subscription/types";

const verifyCompanyCanUpgradeEnterprise = (company, fnParams) => {
  const { metadata } = company.attributes.profile;
  const {
    subscription
  } = metadata;

  if (!subscription) {
    throw ({
      code: 404,
      data: createFlexErrorObject({
        status: 404,
        message: SUBSCRIPTION_NOT_FOUND_ERROR,
        messageCode: SUBSCRIPTION_NOT_FOUND_ERROR
      })
    });
  }

  const {
    type,
    status
  } = subscription;

  if (type === OCEAN_PLAN) {
    throw ({
      code: 409,
      data: createFlexErrorObject({
        status: 409,
        message: WRONG_SUBSCRIPTION_TYPE_ERROR,
        messageCode: WRONG_SUBSCRIPTION_TYPE_ERROR
      })
    });
  }

  switch (status) {
    case SUBSCRIPTION_CANCELLED_STATE:
      throw ({
        code: 409,
        data: createFlexErrorObject({
          status: 409,
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


const checkSubscriptionRequirement = fnParams => async (customer) => {
  const { publicData } = customer.attributes.profile;
  const {
    teamMemberIds
  } = publicData;
  const isCompanyAccount = !!teamMemberIds;
  if (isCompanyAccount) {
    verifyCompanyCanUpgradeEnterprise(customer, fnParams);
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
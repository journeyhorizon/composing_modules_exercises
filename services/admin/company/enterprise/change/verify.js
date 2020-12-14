import {
  NEED_COMPANY_ACCOUNT_TO_START_SUBSCRIPTION_ERROR,
  NEW_PORT_QUANTITY_IS_SMALLER_THAN_CURRENT_ACTIVE_PORT_ERROR,
  SUBSCRIPTION_ALREADY_EXIST_ERROR
} from "../../../../error_type";
import { createFlexErrorObject } from "../../../../on_behalf_of/error";
import {
  OCEAN_PLAN,
  SUBSCRIPTION_ACTIVE_STATE,
  SUBSCRIPTION_INCOMPLETE_STATE,
  SUBSCRIPTION_PAST_DUE_STATE,
  SUBSCRIPTION_TRIAL_STATE,
  SUBSCRIPTION_UNPAID_STATE
} from "../../../../subscription/types";

const verifyCompanyCanUpgradeEnterprise = (company, fnParams) => {
  const { metadata } = company.attributes.profile;
  const {
    subscription
  } = metadata;

  if (!subscription) {
    return { valid: true };
  }

  const {
    activePorts = 0,
    type,
    status
  } = subscription;

  if (type === OCEAN_PLAN) {
    switch (status) {
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
  }

  const { quantity } = fnParams;

  if (quantity < activePorts) {
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
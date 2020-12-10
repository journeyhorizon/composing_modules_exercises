import { ENTERPRISE_PLAN } from "../../../../subscription/types";
import config from "../../../../config";
import { composePromises } from "../../../../utils";
import openClosedPorts from './handle_port';
import { integrationSdk } from "../../../../sharetribe_admin";

const updateProfile = ({
  fnParams,
  company,
  activePorts
}) => {
  const {
    params: {
      quantity
    }
  } = fnParams;

  const {
    attributes: {
      profile: {
        metadata: {
          subscription: subscriptionMetadata
        }
      }
    }
  } = company;

  const metadata = {
    subscription: {
      ...subscriptionMetadata,
      status: 'active',
      id: ENTERPRISE_PLAN,
      type: ENTERPRISE_PLAN,
      plans: [
        {
          id: `${ENTERPRISE_PLAN}-port`,
          metadata: {},
          price: {
            id: `${ENTERPRISE_PLAN}`,
            livemode: config.env === 'production',
            tiersMode: "graduated",
            currency: "usd",
            billingScheme: "tiered",
            nickname: `${ENTERPRISE_PLAN}-port`
          },
          quantity,
          currency: "usd",
          nickname: `${ENTERPRISE_PLAN}-port`,
          billingScheme: null
        },
        {
          id: `${ENTERPRISE_PLAN}-addon`,
          metadata: {},
          price: {
            id: `${ENTERPRISE_PLAN}`,
            livemode: config.env === 'production',
            tiersMode: null,
            currency: "usd",
            billingScheme: "per_unit",
            nickname: `${ENTERPRISE_PLAN}-addon`
          },
          quantity: 1,
          currency: "usd",
          nickname: `${ENTERPRISE_PLAN}-addon`,
          billingScheme: null
        }
      ]
    }
  }

  if (activePorts) {
    metadata.subscription.activePorts = activePorts;
  }

  return integrationSdk.users.updateProfile({
    id: company.id,
    metadata
  });
}

const handleChangeEnterprise = fnParams => async (
  company,
) => {
  const {
    attributes: {
      profile: {
        metadata: {
          subscription: subscriptionMetadata
        }
      }
    }
  } = company;

  const {
    type,
  } = subscriptionMetadata || {};

  if (!subscriptionMetadata || type === ENTERPRISE_PLAN) {
    return updateProfile({
      fnParams,
      company
    });
  }

  return composePromises(
    openClosedPorts,
    updateProfile
  )({
    fnParams,
    company
  });
}

export default handleChangeEnterprise;
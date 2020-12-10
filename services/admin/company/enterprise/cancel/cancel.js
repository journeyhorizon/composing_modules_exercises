import {
  ENTERPRISE_PLAN, SUBSCRIPTION_CANCELLED_STATE
} from "../../../../subscription/types";
import { composePromises } from "../../../../utils";
import closePorts from './handle_port';
import { integrationSdk } from "../../../../sharetribe_admin";

const updateProfile = ({
  company,
  forcedClosePortIds
}) => {
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
    forcedClosePortIds,
    subscription: {
      ...subscriptionMetadata,
      activePorts: 0,
      status: SUBSCRIPTION_CANCELLED_STATE,
      id: ENTERPRISE_PLAN,
      type: ENTERPRISE_PLAN,
    }
  }

  return integrationSdk.users.updateProfile({
    id: company.id,
    metadata
  });
}

const handleChangeEnterprise = async (
  company,
) => {
  return composePromises(
    closePorts,
    updateProfile
  )({
    company
  });
}

export default handleChangeEnterprise;
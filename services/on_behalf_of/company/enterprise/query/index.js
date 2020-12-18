import { denormalisedResponseEntities, sdk, } from '../../../../sharetribe';
import verifyAdminRole from "../../verify_admin";
import adminSdk from '../../../../admin';
import { composePromises } from "../../../../utils";
import finalise from './finalise';
import handlePagination from './handle_pagination';

const queryEnterpriseUsers = async ({
  clientQueryParams,
  clientTokenStore,
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];
  verifyAdminRole(currentUser);

  return composePromises(
    adminSdk.company.enterprise.query,
    handlePagination(clientQueryParams),
    finalise,
  )();
}

export default queryEnterpriseUsers;
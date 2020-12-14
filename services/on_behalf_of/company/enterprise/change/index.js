import { denormalisedResponseEntities, sdk, types as sdkTypes } from '../../../../sharetribe';
import verifyAdminRole from "../../verify_admin";
import adminSdk from '../../../../admin';
import { composePromises } from "../../../../utils";
import finalise from './finalise';
import fetchAllDataInDynamoDB from '../../../../admin/company/enterprise/query/fetch_dynamo';

const changeEnterprisePlan = async ({
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];

  verifyAdminRole(currentUser);

  return composePromises(
    adminSdk.company.enterprise.change,
    fetchAllDataInDynamoDB,
    finalise(clientQueryParams),
  )({
    customerId: clientQueryParams.customerId,
    quantity: clientQueryParams.quantity,
  });
}


export default changeEnterprisePlan;
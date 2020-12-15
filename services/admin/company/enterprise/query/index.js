import { composePromises } from "../../../../utils";
import fetchAllDataInDynamoDB from './fetch_dynamo';
import finalise from "./finalise";
import getEnterpriseUsers from "./get_enterprise_users";

const query = async () => {
  return composePromises(
    fetchAllDataInDynamoDB,
    getEnterpriseUsers,
    finalise,
  )();
}

export default query;
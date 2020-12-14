import { composePromises } from "../../../../utils";
import fetchAllDataInDynamoDB from './fetch_dynamo';
import finalise from "./finalise";

const query = async () => {
  return composePromises(
    fetchAllDataInDynamoDB,
    finalise,
  )();
}

export default query;
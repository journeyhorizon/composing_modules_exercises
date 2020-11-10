import { denormalisedResponseEntities, sdk } from "../../sharetribe";
import { integrationSdk } from "../../sharetribe_admin";
import { transformClientQueryParams } from "../../utils";
import { TRANSITION_RECORD_OFF_PLATFORM } from "../processes";

const query = async (fnParams) => {
  const { clientQueryParams, clientTokenStore } = fnParams;
  const queryParams = transformClientQueryParams(clientQueryParams);
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];
  const { startDate, endDate } = queryParams;
  const queriedTransactionsRes = await integrationSdk
    .transactions
    .query({
      userId: currentUser.id.uuid,
      createdAtStart: new Date(startDate),
      createdAtEnd: new Date(endDate)
    });
  const queriedTransactions = denormalisedResponseEntities(queriedTransactionsRes);
  const sortedTransactions = queriedTransactions.reduce((result, tx) => {
    if (tx.attributes.lastTransition === TRANSITION_RECORD_OFF_PLATFORM) {
      result.offPlatform.push(tx);
    } else {
      result.onPlatform.push(tx);
    }
    return result;
  }, {
    onPlatform: [],
    offPlatform: []
  });
  queriedTransactionsRes.data.sorted = sortedTransactions;
  return queriedTransactionsRes;
}

export default query;
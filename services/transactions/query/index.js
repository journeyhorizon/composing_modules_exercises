import { denormalisedResponseEntities, sdk } from "../../sharetribe";
import { integrationSdk } from "../../sharetribe_admin";
import { transformClientQueryParams } from "../../utils";
import { TRANSITION_RECORD_OFF_PLATFORM } from "../processes";

const queryAll = async ({
  func,
  page = 1,
  perPage = 100,
  params = {},
}) => {
  const fnParams = {
    ...params,
    page,
    per_page: perPage,
  }
  const res = await func(fnParams);
  const { meta } = res.data;
  const {
    totalPages
  } = meta;

  if (page >= totalPages) {
    return res;
  }
  const nextData = await queryAll({
    params,
    page: page + 1,
    func
  });
  res.data.data = res.data.data.concat(nextData.data.data);
  res.data.included = res.data.included.concat(nextData.data.included)
  return res;
}

const query = async (fnParams) => {
  const { clientQueryParams, clientTokenStore } = fnParams;
  const queryParams = transformClientQueryParams(clientQueryParams);
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const currentUserRes = await trustedSdk.currentUser.show();
  const currentUser = denormalisedResponseEntities(currentUserRes)[0];
  const { startDate, endDate } = queryParams;
  const queriedTransactionsRes = await queryAll({
    func: integrationSdk.transactions.query,
    params: {
      userId: currentUser.id.uuid,
      createdAtStart: new Date(startDate),
      createdAtEnd: new Date(endDate),
      include: ['customer', 'booking']
    },
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
import cloneDeep from 'lodash/cloneDeep';

const createSubscriptionParams = async (fnParams) => {
  const params = cloneDeep(fnParams);
  delete params.transfer_data;
  params.metadata = {
    ...fnParams.metadata,
    'need_update_on_behalf_of': true,
  }
  if (params.application_fee_percent) {
    params.metadata.application_fee_percent = params.application_fee_percent;
  }
  delete params.application_fee_percent;
  return params;
}

export default createSubscriptionParams;
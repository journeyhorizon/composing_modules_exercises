const sdk = {
  create,
  update,
  delete
};

const payoutQueueSdk = addFinalizeResponseFnc(sdk);

export default payoutQueueSdk;
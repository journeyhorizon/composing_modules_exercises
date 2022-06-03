import productStripeSdk from "../../../product";

const createStripeProduct = async ({
  params,
  trustedSdk
}) => {
  /**
   * There are many better ways to handle this, but for now, we'll just make it fast
   * and dirty.
   * This is for handling creating Stripe product when a listing is created
   * But it's too time-consuming to do it when it's actually created by the user
   * So we'll do it when the transaction is created
   * We would also do not care if if existed or not
   * If it's already existed, we'll ignore the creation errors
   */
  await productStripeSdk.create({
    id: params.listingId
  }).catch(e => {
    // Ignore the error
    console.log(e);
  })

  delete params.listingId;
  
  return {
    params,
    trustedSdk
  };
}

export default createStripeProduct;
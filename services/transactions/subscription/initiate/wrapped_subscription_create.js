import { createFlexErrorObject } from "../../../error";
import subscriptionSdk from "../../../subscription";

const wrappedSubscriptionCreate = async ({
  params,
  trustedSdk
}) => {
  return subscriptionSdk.create(params)
    .then(res => {
      if (res.code !== 200) {
        throw ({
          code: 500,
          data: createFlexErrorObject({
            code: 500,
            message: res.data
          })
        });
      }
      return {
        subscription: res.data,
        trustedSdk,
      };
    });
}

export default wrappedSubscriptionCreate;
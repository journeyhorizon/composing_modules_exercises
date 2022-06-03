import { LISTING_TYPE } from "../../util";

const transitionFlexTransaction = ({
  params,
  id,
  transition
}) => async ({
  subscription,
  trustedSdk
}) => {
    const body = {
      id,
      params,
      transition,
    }

    body.params.protectedData = {
      ...body.params.protectedData,
      subscriptionId: subscription.id.uuid,
      subscriptionObject: {
        timestamp: (new Date).getTime(),
      },
      type: LISTING_TYPE.SUBSCRIPTION
    };

    return trustedSdk.transactions.transition(body, {
      include: ['booking', 'provider'],
      expand: true,
    });
  }

export default transitionFlexTransaction;
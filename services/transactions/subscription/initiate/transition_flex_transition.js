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

    //TODO: Check why the proctedData is not being set

    body.params.protectedData = {
      ...body.params.protectedData,
      subscriptionId: subscription.id,
      subscriptionObject: {
        timestamp: (new Date).getTime(),
      },
    };

    return trustedSdk.transactions.transition(body, {
      include: ['booking', 'provider'],
      expand: true,
    });
  }

export default transitionFlexTransaction;
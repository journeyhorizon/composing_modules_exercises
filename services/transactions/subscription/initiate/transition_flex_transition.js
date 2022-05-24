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
    if (!!body.params.protectedData) {
      body.params.protectedData.subscriptionId = subscription.id;
      body.params.protectedData.subscriptionObject = {
        timestamp: (new Date).getTime(),
      };
    }
    return trustedSdk.transactions.transition(body, {
      include: ['booking', 'provider'],
      expand: true,
    });
  }

export default transitionFlexTransaction;
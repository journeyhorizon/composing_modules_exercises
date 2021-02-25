const createStorableParams = ({
  id,
  stripeId,
  params
}) => {
  const {
    protectedData,
    amount,
    currency,
    triggerDate
  } = params;

  return {
    stripeId,
    protectedData,
    amount,
    currency,
    triggerDate,
    id
  };;
}

export default createStorableParams;
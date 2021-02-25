import { v4 as uuidv4 } from 'uuid';

const createStorableParams = async ({
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

  const storableParams = {
    stripeId,
    protectedData,
    amount,
    currency,
    triggerDate
  };

  storableParams.id = !!id
    ? id
    : uuidv4();

  return storableParams;
}

export default createStorableParams;
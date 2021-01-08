import { getUserData } from '../../../sharetribe_admin';
import fetchCustomer from '../fetch_user';

const fetchProvider = async (userId) => {
  return getUserData({ userId, include: ['stripeAccount'] });
}

const fetchUsersData = async ({
  customerId,
  providerId
}) => {
  const [customer, provider] = await Promise.all([
    fetchCustomer(customerId),
    fetchProvider(providerId)
  ]);

  return {
    customer,
    provider
  };
}

export default fetchUsersData;
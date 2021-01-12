import { getUserData } from '../../../sharetribe_admin';
import fetchCustomer from '../../common_functions/fetch_user_with_stripe_customer';

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
import { getUserData } from "../../sharetribe_admin";

const fetchCustomer = async (userId) => {
  return getUserData({ userId, include: ['stripeAccount'] })
}

export default fetchCustomer;

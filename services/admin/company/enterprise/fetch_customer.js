import { getUserData } from "../../../sharetribe_admin";

const fetchCustomer = (userId) => async () => {
  return getUserData({ userId });
}

export default fetchCustomer;

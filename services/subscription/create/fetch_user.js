// import { getUserData } from "../../sharetribe_admin";

import { getUserData } from "../../sharetribe_admin";

const fetchCustomer = async (userId) => {
  return getUserData({ userId });
}

export default fetchCustomer;

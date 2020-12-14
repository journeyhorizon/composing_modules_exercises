import { getUserData } from "../../../sharetribe_admin";

const fetchUser = async (userId) => {
  return getUserData({ userId })
}

export default fetchUser;

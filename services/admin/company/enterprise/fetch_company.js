import { getUserData } from "../../../sharetribe_admin";

const fetchCompany = async (userId) => {
  return getUserData({ userId })
}

export default fetchCompany;
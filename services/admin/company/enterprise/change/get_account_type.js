import { getUserData } from "../../../../sharetribe_admin";
import { COMPANY_TYPE, TEAM_MEMBER_TYPE } from "./types";

const getAccountType = async (customerId) => {
  const currentUser = await getUserData({ userId: customerId });

  const { metadata } = currentUser.attributes.profile;
  const {
    pageAccountId
  } = metadata;

  if (!!pageAccountId) {
    return {
      id: customerId,
      type: COMPANY_TYPE,
      data: currentUser
    };
  } else {
    return {
      id: customerId,
      type: TEAM_MEMBER_TYPE,
      data: currentUser
    };
  }
}

export default getAccountType;
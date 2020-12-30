import { getUserData } from "../../../../sharetribe_admin";
import { COMPANY_TYPE, TEAM_MEMBER_TYPE } from "./types";

const getAccountType = async (customerId) => {
  const currentUser = await getUserData({ userId: customerId });

  const { metadata } = currentUser.attributes.profile;
  const {
    pageAccountId
  } = metadata;

  const { publicData } = currentUser.attributes.profile;
  const {
    teamMemberIds
  } = publicData;

  if (!!teamMemberIds) {
    return {
      id: customerId,
      type: COMPANY_TYPE,
      data: currentUser
    };
  } else if (!!pageAccountId) {
    return {
      id: pageAccountId,
      type: COMPANY_TYPE,
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
import { generateToken } from "../../authentication";
import config from "../../config";
import { send } from "../../notification/email";
import { WRONG_PARAMS } from "../../error_type";
import { TEAM_MEMBER_INVITE } from "../../notification/email";
import { sdk, types as sdkTypes } from "../../sharetribe";
import { getListingData, getUserData, integrationSdk } from "../../sharetribe_admin";
import { createFlexErrorObject } from "../error";
import { PAGE_LISTING_TYPE, TEAM_MEMBER_ADD, TEAM_MEMBER_REMOVE, TEAM_MEMBER_RESEND } from "../types";
import { generatePassword } from "../utils";
import cloneDeep from 'lodash/cloneDeep';

const { UUID } = sdkTypes;

// const teamManagementObj = [
//   {
//     status: TEAM_MEMBER_REMOVE,
//     email: 'test1@journeyh.io',
//     id: new UUID('REMOVE_USER')
//   },
//   {
//     status: TEAM_MEMBER_ADD,
//     email: 'test2@journeyh.io'
//   }
// ];

const removeTeamMembers = async ({
  teamMembersToRemove,
  listing
}) => {
  const { teamMemberIds } = listing.author.attributes.profile.publicData;
  const idToRemove = teamMembersToRemove.map(teamMember => teamMember.id);
  const newTeamMemberIds = teamMemberIds.filter(teamMemberId =>
    !idToRemove.includes(teamMemberId));
  const updateTeamMemberData = async () => teamMembersToRemove.length < 1
    ? Promise.resolve()
    : Promise.all(teamMembersToRemove.map(teamMember => {
      if (!teamMemberIds.includes(teamMember.id)) {
        return Promise.resolve();
      }

      return integrationSdk.users.updateProfile({
        id: new UUID(teamMember.id),
        metadata: {
          pageAccountId: null
        }
      })
    }))
  return Promise.all([
    integrationSdk.users.updateProfile({
      id: listing.author.id,
      publicData: {
        teamMemberIds: newTeamMemberIds
      }
    }),
    updateTeamMemberData()
  ]);
}

const generateVerificationLink = ({
  token,
  listing,
  email
}) => {
  return `${config.webCanonicalUrl}/verify-team-member?t=${token}&email=${email}&pageListingId=${listing.id.uuid}`;
}

const sendVerificationEmail = async ({
  email,
  verificationLink,
  firstName,
  marketplaceName,
  pageName
}) => {
  return send(email, TEAM_MEMBER_INVITE, {
    verificationLink,
    firstName,
    marketplaceName,
    pageName
  });
}

const handleMemberAuthorization = ({
  teamMembers,
  listing
}) => {
  return Promise.all(teamMembers.map(teamMember => {
    const { email } = teamMember;
    const jwtToken = generateToken({
      email,
      pageAccountId: listing.author.id.uuid,
    });
    const verificationLink = generateVerificationLink({
      token: jwtToken,
      listing,
      email
    });

    //TODO: Move marketplace name to better config
    return sendVerificationEmail({
      email,
      verificationLink,
      firstName: email,
      marketplaceName: config.env === 'production'
        ? 'The Seafarers Shop'
        : 'The Seafarers Shop Test',
      pageName: listing.attributes.title
    });
  }))
}

const authorizeTeamMembers = async ({
  teamMembersToAdd: clientTeamMembersToAdd,
  teamMembersToResend: clientTeamMembersToResend,
  listing
}) => {
  const author = listing.author;
  const currentTeamMembers = await Promise.all(author
    .attributes
    .profile
    .publicData
    .teamMemberIds
    .map(id => {
      return getUserData({ userId: id })
        .then(user => {
          return user.attributes.email
        });
    }));
  const teamMembersToAdd = clientTeamMembersToAdd.filter(teamMember => {
    return !currentTeamMembers.includes(teamMember.email);
  });
  const teamMembersToResend = clientTeamMembersToResend.filter(teamMember => {
    return !currentTeamMembers.includes(teamMember.email);
  });

  const handleInviteTeamMember = () => {
    const currentPendingTeamMembers = author
      .attributes
      .profile
      .metadata
      .pendingTeamMembers;

    return Promise.all([
      handleMemberAuthorization({
        teamMembers: teamMembersToAdd,
        listing
      }),
      integrationSdk.users.updateProfile({
        id: listing.author.id,
        metadata: {
          pendingTeamMembers: Array.isArray(currentPendingTeamMembers)
            ? [
              ...currentPendingTeamMembers,
              ...teamMembersToAdd.map(teamMember => teamMember.email)
            ]
            : teamMembersToAdd.map(teamMember => teamMember.email)
        }
      })
    ]);
  }

  const handleResendInviteTeamMember = () => {
    return handleMemberAuthorization({
      teamMembers: teamMembersToResend,
      listing
    });
  }

  return Promise.all([
    handleInviteTeamMember(),
    handleResendInviteTeamMember()
  ]);
}

const resendTeamMemberInvitation = async ({
  teamMembersToResend,
  listing
}) => {
  return handleMemberAuthorization({
    teamMembers: teamMembersToResend,
    listing
  });
};

const handleTeamMemberManagement = ({
  teamManagementObj,
  listing,
}) => {
  const author = listing.author;
  const { pendingTeamMembers = [] } = author.attributes.profile.metadata;
  const teamMembersToRemove = teamManagementObj.filter(({ status }) => status === TEAM_MEMBER_REMOVE);
  const teamMembersToAdd = teamManagementObj.filter(({ status, email }) =>
    status === TEAM_MEMBER_ADD && !pendingTeamMembers.includes(email));
  const teamMembersToResend = teamManagementObj.filter(({ status, email }) =>
    status === TEAM_MEMBER_RESEND && pendingTeamMembers.includes(email));
  return Promise.all([
    authorizeTeamMembers({
      teamMembersToAdd,
      teamMembersToResend,
      listing
    }),
    removeTeamMembers({
      teamMembersToRemove,
      listing
    }),
  ]);
}

const handleUpdatePageListing = async ({
  data,
  listing,
  clientTokenStore,
  clientQueryParams
}) => {
  const trustedSdk = await sdk.jh.getTrustedSdk(clientTokenStore);
  const { include = '', expand } = clientQueryParams;

  const queryParams = {
    expand: expand === 'true' ? true : false,
    include: include.split(',')
  };

  const {
    publicData = {}
  } = data;

  let finalParams = cloneDeep(data);

  if (publicData.email && listing.author.attributes.email !== publicData.email) {
    await trustedSdk.currentUser
      .changeEmail(
        {
          email: publicData.email,
          currentPassword: generatePassword(listing.author.id.uuid)
        }
      );
  }

  if (Array.isArray(publicData.teamManagementObj) && publicData.teamManagementObj.length > 0) {
    finalParams.publicData.teamManagementObj = [];
    await handleTeamMemberManagement({
      teamManagementObj: publicData.teamManagementObj,
      listing
    });
  }
  const updateResult = await trustedSdk.ownListings
    .update(finalParams, queryParams);

  return updateResult;
}

const update = async ({
  data,
  clientTokenStore,
  clientQueryParams
}) => {
  const listing = await getListingData({ listingId: data.id.uuid });
  const { publicData } = listing.attributes;
  const {
    listingType
  } = publicData;

  switch (listingType) {
    case PAGE_LISTING_TYPE: {
      return handleUpdatePageListing({
        data,
        listing,
        clientTokenStore,
        clientQueryParams
      });
    }
    default: {
      return {
        code: 400,
        data: createFlexErrorObject({
          message: WRONG_PARAMS,
          messageCode: WRONG_PARAMS,
          status: 400
        })
      };
    }
  }

}

export default update;
import { ADMIN_ROLE } from '../../config/roles';
import { INVALID_ROLE_ERROR } from '../../error_type';
import { createFlexErrorObject } from '../error';

const verifyAdminRole = async (currentUser) => {
  const { metadata } = (currentUser && currentUser.attributes.profile) || {};
  const { role } = metadata || {};
  if (role !== ADMIN_ROLE) {
    throw ({
      code: 401,
      data: createFlexErrorObject({
        status: 401,
        message: INVALID_ROLE_ERROR,
        messageCode: INVALID_ROLE_ERROR
      })
    });
  }
  return currentUser;
}

export default verifyAdminRole;
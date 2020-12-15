import { getUserData } from '../../../../sharetribe_admin';

const getEnterpriseUsers = async (res) => {
  return Promise.all(res.Items
    .map(item => getUserData({ userId: item.id })))
    .then(response => {
      return response;
    });
};

export default getEnterpriseUsers;
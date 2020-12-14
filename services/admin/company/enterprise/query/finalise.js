import { getUserData } from '../../../../sharetribe_admin';

const finalise = async (res) => {
  return Promise.all(res.Items
    .map(item => getUserData({ userId: item.id })))
    .then(response => {
      return {
        code: 200,
        data: {
          data: response,
        },
      };
    });
}

export default finalise;
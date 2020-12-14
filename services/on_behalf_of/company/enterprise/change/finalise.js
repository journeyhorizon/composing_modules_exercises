import { getUserData } from '../../../../sharetribe_admin';

const finalise = fnParams => async (res) => {
  const { page, per_page } = fnParams;
  const perPageNumber = parseInt(per_page);
  const pageNumber = parseInt(page);

  const start = pageNumber * perPageNumber - perPageNumber;
  const end = pageNumber * perPageNumber;

  const filterForPagination = (start, end) => {
    if (start === 0) {
      return res.Items.slice(-end);
    } else {
      return res.Items.slice(-end, -start);
    }
  };

  return Promise.all(filterForPagination(start, end)
    .map(item => getUserData({ userId: item.id })))
    .then(response => {
      return {
        code: 200,
        data: {
          data: response,
          meta: {
            page: parseInt(page),
            perPage: perPageNumber,
            totalItems: res.Count,
            totalPages: Math.ceil(res.Count / perPageNumber),
          }
        },
      };
    });
}

export default finalise;
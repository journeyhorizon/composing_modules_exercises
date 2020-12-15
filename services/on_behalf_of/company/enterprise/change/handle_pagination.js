import { denormalisedResponseEntities } from '../../../../sharetribe';

const handlePagination = fnParams => async (res) => {
  const enterpriseUsers = denormalisedResponseEntities(res);
  const { page, per_page } = fnParams;
  const perPageNumber = parseInt(per_page);
  const pageNumber = parseInt(page);

  const start = pageNumber * perPageNumber - perPageNumber;
  const end = pageNumber * perPageNumber;

  const filterForPagination = (start, end) => {
    if (start === 0) {
      return enterpriseUsers.slice(-end);
    } else {
      return enterpriseUsers.slice(-end, -start);
    }
  };

  const pagination = {};
  pagination.data = filterForPagination(start, end);
  pagination.meta = {
    page: pageNumber,
    perPage: perPageNumber,
    totalItems: enterpriseUsers.length,
    totalPages: Math.ceil(enterpriseUsers.length / perPageNumber),
  };

  return pagination;
}

export default handlePagination;
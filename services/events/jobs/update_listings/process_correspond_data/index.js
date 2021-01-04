import chunk from 'lodash/chunk';
import handleCompanyData from './handle_company_data';

const REQUEST_CAP = 5;

const processCorrespondProducts = async (companies) => {
  const splittedChunks = chunk(companies, REQUEST_CAP);
  return new Promise(async (resolve, reject) => {
    let result = [];
    for (let i = 0; i < splittedChunks.length; i++) {
      const data = await handleCompanyData(splittedChunks[i]);
      result.push(data);
    }
    resolve(result);
  });
}

export default processCorrespondProducts;
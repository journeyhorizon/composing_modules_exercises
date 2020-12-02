import authenticateTeamMember from '../../../services/authentication';
import OnBeHalfOfSdk from '../../../services/on_behalf_of';
import { COMPANY_CREATION } from '../../../services/on_behalf_of/types';
import { transformClientQueryParams } from "../../../services/utils";

const handleCompanyAccessRequest = async (req, res, next) => {
  const queryParams = transformClientQueryParams(req.query || {});
  const { type } = queryParams;
  if (type === COMPANY_CREATION) {
    const result = await OnBeHalfOfSdk
      .company.create({
        clientTokenStore: res.locals.tokenStore,
      });
    res.locals.response = result.data;
    res.status(result.code);
  } else {
    const result = await authenticateTeamMember({
      clientTokenStore: res.locals.tokenStore,
    });
    res.locals.response = result.data;
    res.status(result.code);
  }
  next();
}

export default handleCompanyAccessRequest;
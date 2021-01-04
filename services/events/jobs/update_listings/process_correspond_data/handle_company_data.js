import { LISTING_STATE_PUBLISHED } from '../../../../on_behalf_of/types';
import { fetchPortsNumber } from '../../../../sharetribe/utils';
import { getUserData, integrationSdk } from '../../../../sharetribe_admin';
import { composePromises } from '../../../../utils';
import handleUpdateProductsState from './handle_update_products_state';

const updateActivePortsInSubscriptionData = company => async (activePorts) => {
  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = company;

  subscription.activePorts = activePorts;

  return integrationSdk.users.updateProfile({
    id: company.id,
    metadata: {
      subscription
    }
  });
}

const handleUpdateActivePorts = async (company) => {
  return composePromises(
    fetchPortsNumber,
    updateActivePortsInSubscriptionData(company),
  )({
    authorId: company.id.uuid,
    states: LISTING_STATE_PUBLISHED
  });
}

const handleCompanyData = async (companies) => {
  return Promise.all(companies.map(async (companyObj) => {
    const { eventByListing = {} } = companyObj.attributes;
    const events = Object.values(eventByListing);
    return Promise.all([
      handleUpdateProductsState({ events, authorId: companyObj.id.uuid }),
      composePromises(
        getUserData,
        handleUpdateActivePorts,
      )({
        userId: companyObj.id.uuid
      })
    ]);
  }))
}

export default handleCompanyData;
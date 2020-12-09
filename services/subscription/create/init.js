import config from "../../config";
import { stripe } from "../../stripe";

const LIMIT = 100;

const getCountryTaxList = () => {
  return stripe.taxRates.list({
    limit: LIMIT,
    active: true
  })
    .then(res => {
      return res.data;
    });
}

const handleCreateNewSubscription = async ({
  company,
  items,
  protectedData,
  disableTrial
}) => {
  const params = {
    customer: company.stripeCustomer.id,
    items,
    metadata: {
      protectedData: JSON.stringify(protectedData),
      'sharetribe-user-id': company.id.uuid,
    }
  }

  if (!disableTrial) {
    params.trial_period_days = config.subscription.trialPeriod;
  }

  const {
    attributes: {
      profile: {
        protectedData: {
          countryCode
        }
      }
    }
  } = company;

  if (countryCode) {
    const taxesConfigs = await getCountryTaxList();
    const taxObject = taxesConfigs.find(taxesConfig => {
      return taxesConfig.metadata.countryCode === countryCode;
    });
    if (taxObject) {
      params.default_tax_rates = [taxObject.id];
    }
  }

  return stripe.subscriptions.create(params)
    .then(subscription => {
      return {
        company,
        subscription
      }
    });
}

const initSubscription = (fnParams) => async (company) => {
  const {
    params: {
      lineItems,
      protectedData
    }
  } = fnParams;

  const items = lineItems.map(({
    pricingId,
    quantity
  }) => {
    return {
      price: pricingId,
      quantity
    }
  });

  const {
    attributes: {
      profile: {
        metadata: {
          subscription
        }
      }
    }
  } = company;

  const params = {
    company,
    items,
    protectedData
  };

  if (subscription) {
    params.disableTrial = true;
  }

  return handleCreateNewSubscription(params);
}

export default initSubscription;
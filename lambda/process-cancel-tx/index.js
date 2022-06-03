import axios from 'axios';
import sharetribeIntegrationSdk from 'sharetribe-flex-integration-sdk'; 

// TRANSITIONS
const TRANSITION_CANCEL_REFUND_SUBSCRIPTION = 'transition/cancel-refund-subscription';
const TRANSACTION_AUTO_CANCEL_SUBSCRIPTION_NOT_DELIVERED = 'transition/auto-cancel-subscription-not-delivered';
const TRANSACTION_CANCEL_ONGOING_SUBSCRIPTION = 'transtition/cancel-ongoing-subscription';
const CANCEL_TRANSITIONS = [TRANSITION_CANCEL_REFUND_SUBSCRIPTION, TRANSACTION_AUTO_CANCEL_SUBSCRIPTION_NOT_DELIVERED, TRANSACTION_CANCEL_ONGOING_SUBSCRIPTION];

// EVENT TYPES
const EVENT_TYPE_TRANSACTION_TRANSITIONED = 'transaction/transitioned';

// Axios configuration
const serverUrl = process.env.EXTERNAL_SERVER_URL;
const config = { headers : { 'Content-Type': 'application/json' } };

// Create new SDK instance
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.INTEGRATION_CLIENT_ID,
  clientSecret: process.env.INTEGRATION_CLIENT_SECRET
});

const queryEventData = (params) => integrationSdk.events.query(params);

const getPromise = (lastTransition) => {
  switch(lastTransition) {
    case TRANSITION_CANCEL_REFUND_SUBSCRIPTION: {
      return axios.post(axios.post(serverUrl + '/', {}, config));
    }
    case TRANSACTION_AUTO_CANCEL_SUBSCRIPTION_NOT_DELIVERED: {
      return axios.post(axios.post(serverUrl + '/', {}, config));
    }
    case TRANSACTION_CANCEL_ONGOING_SUBSCRIPTION: {
      return axios.post(axios.post(serverUrl + '/', {}, config));
    }
  }
}

const getSubscriptionCancellationPromises = (events) => {
  return events.data.data.reduce((promises, event) => {
    const { lastTransition } = event.attributes.resource.attributes;
    const isCancelSubscriptionTx = CANCEL_TRANSITIONS.includes(lastTransition);
    const promise = isCancelSubscriptionTx && getPromise(lastTransition);
    return promise ? [...promises, promise] : promises;
  }, []);
}

export const handler = async (event, context) => {
  const events = await queryEventData({
    eventTypes: EVENT_TYPE_TRANSACTION_TRANSITIONED 
  });

  const cancelEvents = await Promise.all(getSubscriptionCancellationPromises(events));
};
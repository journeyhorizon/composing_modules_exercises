import { stripe } from ".."
import subscriptionEventHandler from './subscription';
import invoiceEventHandler from './invoice';

const receive = async (
  requestBody,
  signature,
  endpointSecret
) => {
  let event = null;
  try {
    event = stripe
      .webhooks
      .constructEvent(requestBody, signature, endpointSecret);
  }
  catch (err) {
    return {
      code: 400,
      data: {
        message: `Webhook Error: ${err.message}`
      }
    };
  }

  // Handle the event
  const { account, data: { object } } = event;

  switch (event.type) {
    case 'customer.subscription.created': {
      return subscriptionEventHandler.created({
        subscription: object
      });
    }
    case 'customer.subscription.updated': {
      return subscriptionEventHandler.updated({
        subscription: object
      });
    }
    case 'customer.subscription.deleted': {
      return subscriptionEventHandler.deleted({
        subscription: object
      });
    }
    case 'invoice.payment_action_required':
    case 'invoice.payment_failed': {
      return invoiceEventHandler.failed({
        invoice: object
      });
    }
    case 'invoice.created': {
      return invoiceEventHandler.created({
        invoice: object
      });
    }
    default: {
      return {
        code: 200,
        data: {
          received: true
        }
      };
    }
  }
}

export default receive;
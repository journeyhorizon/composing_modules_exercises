import { ensureTransaction } from '../validator';

export const LISTING_TYPE = {
  PREPACKAGED: 'prepackaged',
  SUBSCRIPTION: 'subscription'
}

/**
 * Transitions
 *
 * These strings must sync with values defined in Flex API,
 * since transaction objects given by API contain info about last transitions.
 * All the actions in API side happen in transitions,
 * so we need to understand what those strings mean.
 */

// When a customer makes an order for a listing, a transaction is
// created with the initial request-payment transition.
// At this transition a PaymentIntent is created by Marketplace API.
// After this transition, the actual payment must be made on client-side directly to Stripe.
export const TRANSITION_REQUEST_PAYMENT = 'transition/request-payment';

// A customer can also initiate a transaction with an enquiry, and
// then transition that with a request.
export const TRANSITION_ENQUIRE = 'transition/enquire';
export const TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY = 'transition/request-payment-after-enquiry';

// Stripe SDK might need to ask 3D security from customer, in a separate front-end step.
// Therefore we need to make another transition to Marketplace API,
// to tell that the payment is confirmed.
export const TRANSITION_CONFIRM_PAYMENT = 'transition/confirm-payment';

// If the payment is not confirmed in the time limit set in transaction process (by default 15min)
// the transaction will expire automatically.
export const TRANSITION_EXPIRE_PAYMENT = 'transition/expire-payment';

// Provider can mark the product shipped/delivered
export const TRANSITION_MARK_DELIVERED = 'transition/mark-delivered';

// Customer can mark the product received (e.g. picked up from provider)
export const TRANSITION_MARK_RECEIVED_FROM_PURCHASED = 'transition/mark-received-from-purchased';

// Automatic cancellation happens if none marks the delivery happened
export const TRANSITION_AUTO_CANCEL = 'transition/auto-cancel';

// Operator can cancel the purchase before product has been marked as delivered / received
export const TRANSITION_CANCEL = 'transition/cancel';

// If provider has marked the product delivered (e.g. shipped),
// customer can then mark the product received
export const TRANSITION_MARK_RECEIVED = 'transition/mark-received';

// If customer doesn't mark the product received manually, it can happen automatically
export const TRANSITION_AUTO_MARK_RECEIVED = 'transition/auto-mark-received';

// When provider has marked the product delivered, customer can dispute the transaction
export const TRANSITION_DISPUTE = 'transition/dispute';

// If nothing is done to disputed transaction it ends up to Canceled state
export const TRANSITION_AUTO_CANCEL_FROM_DISPUTED = 'transition/auto-cancel-from-disputed';

// Operator can cancel disputed transaction manually
export const TRANSITION_CANCEL_FROM_DISPUTED = 'transition/cancel-from-disputed';

// Operator can mark the disputed transaction as received
export const TRANSITION_MARK_RECEIVED_FROM_DISPUTED = 'transition/mark-received-from-disputed';
export const TRANSITION_MARK_RECEIVED_FROM_DISPUTED_BY_CUSTOMER = 'transition/mark-received-from-disputed-by-customer';

// System moves transaction automatically from received state to complete state
// This makes it possible to to add notifications to that single transition.
export const TRANSITION_AUTO_COMPLETE = 'transition/auto-complete';

// Reviews are given through transaction transitions. Review 1 can be
// by provider or customer, and review 2 will be the other party of
// the transaction.
export const TRANSITION_REVIEW_1_BY_PROVIDER = 'transition/review-1-by-provider';
export const TRANSITION_REVIEW_2_BY_PROVIDER = 'transition/review-2-by-provider';
export const TRANSITION_REVIEW_1_BY_CUSTOMER = 'transition/review-1-by-customer';
export const TRANSITION_REVIEW_2_BY_CUSTOMER = 'transition/review-2-by-customer';
export const TRANSITION_EXPIRE_CUSTOMER_REVIEW_PERIOD = 'transition/expire-customer-review-period';
export const TRANSITION_EXPIRE_PROVIDER_REVIEW_PERIOD = 'transition/expire-provider-review-period';
export const TRANSITION_EXPIRE_REVIEW_PERIOD = 'transition/expire-review-period';

//Subscription transitions

export const TRANSITION_REQUEST_PAYMENT_SUBSCRIPTION = 'transition/request-payment-subscription';
export const TRANSITION_REQUEST_PAYMENT_SUBSCRIPTION_AFTER_ENQUIRY = 'transition/request-payment-subscription-after-enquiry';

// Stripe SDK might need to ask 3D security from customer, in a separate front-end step.
// Therefore we need to make another transition to Marketplace API,
// to tell that the payment is confirmed.
export const TRANSITION_CONFIRM_PAYMENT_SUBSCRIPTION = 'transition/confirm-payment-subscription';
export const TRANSITION_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION = 'transition/confirm-saved-payment-subscription';

// If the payment is not confirmed in the time limit set in transaction process (by default 15min)
// the transaction will expire automatically.
export const TRANSITION_EXPIRE_PAYMENT_SUBSCRIPTION = 'transition/expire-payment-subscription';
export const TRANSITION_EXPIRE_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION = 'transition/expire-confirm-saved-payment-subscription';

// Provider can mark the product shipped/delivered
export const TRANSITION_MARK_DELIVERED_SUBSCRIPTION = 'transition/mark-delivered-subscription';

// Automatic cancellation happens if none marks the delivery happened
export const TRANSITION_AUTO_CANCEL_SUBSCRIPTION = 'transition/auto-cancel-subscription-not-delivered';

// Operator can cancel the purchase before product has been marked as delivered / received
export const TRANSITION_CANCEL_REFUND_SUBSCRIPTION = 'transition/cancel-refund-subscription';
export const TRANSITION_CANCEL_ONGOING_SUBSCRIPTION = 'transition/cancel-ongoing-subscription';

// If provider has marked the product delivered (e.g. shipped),
// customer can then mark the product received
export const TRANSITION_MARK_RECEIVED_SUBSCRIPTION = 'transition/confirm-delivered-subscription';

// If customer doesn't mark the product received manually, it can happen automatically
export const TRANSITION_AUTO_MARK_RECEIVED_SUBSCRIPTION = 'transition/auto-confirm-delivered-subscription';

export const TRANSITION_COMPLETE_SUBSCRIPTION = 'transition/complete-subscription';


/**
 * Actors
 *
 * There are 4 different actors that might initiate transitions:
 */

// Roles of actors that perform transaction transitions
export const TX_TRANSITION_ACTOR_CUSTOMER = 'customer';
export const TX_TRANSITION_ACTOR_PROVIDER = 'provider';
export const TX_TRANSITION_ACTOR_SYSTEM = 'system';
export const TX_TRANSITION_ACTOR_OPERATOR = 'operator';

export const TX_TRANSITION_ACTORS = [
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
  TX_TRANSITION_ACTOR_SYSTEM,
  TX_TRANSITION_ACTOR_OPERATOR,
];

/**
 * States
 *
 * These constants are only for making it clear how transitions work together.
 * You should not use these constants outside of this file.
 *
 * Note: these states are not in sync with states used transaction process definitions
 *       in Marketplace API. Only last transitions are passed along transaction object.
 */
const STATE_INITIAL = 'initial';
const STATE_ENQUIRY = 'enquiry';
const STATE_PENDING_PAYMENT = 'pending-payment';
const STATE_PAYMENT_EXPIRED = 'payment-expired';
const STATE_PURCHASED = 'purchased';
const STATE_DELIVERED = 'delivered';
const STATE_RECEIVED = 'received';
const STATE_DISPUTED = 'disputed';
const STATE_CANCELED = 'canceled';
const STATE_COMPLETED = 'completed';
const STATE_REVIEWED = 'reviewed';
const STATE_REVIEWED_BY_CUSTOMER = 'reviewed-by-customer';
const STATE_REVIEWED_BY_PROVIDER = 'reviewed-by-provider';

const STATE_PENDING_PAYMENT_SUBSCRIPTION = 'pending-payment-subscription';
const STATE_PENDING_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION = 'pending-confirm-saved-payment-subscription';
const STATE_PURCHASED_SUBSCRIPTION = 'purchased-subscription';
const STATE_DELIVERED_SUBSCRIPTION = 'delivered-subscription';
const STATE_COMPLETED_SUBSCRIPTION = 'subscription-completed'


/**
 * Description of transaction process
 *
 * You should keep this in sync with transaction process defined in Marketplace API
 *
 * Note: we don't use yet any state machine library,
 *       but this description format is following Xstate (FSM library)
 *       https://xstate.js.org/docs/
 */
const stateDescription = {
  // id is defined only to support Xstate format.
  // However if you have multiple transaction processes defined,
  // it is best to keep them in sync with transaction process aliases.
  id: 'flex-default-process/release-CvVOs8Zp',

  // This 'initial' state is a starting point for new transaction
  initial: STATE_INITIAL,

  // States
  states: {
    [STATE_INITIAL]: {
      on: {
        [TRANSITION_ENQUIRE]: STATE_ENQUIRY,
        [TRANSITION_REQUEST_PAYMENT]: STATE_PENDING_PAYMENT,
        [TRANSITION_REQUEST_PAYMENT_SUBSCRIPTION]: STATE_PENDING_PAYMENT_SUBSCRIPTION,
      },
    },
    [STATE_ENQUIRY]: {
      on: {
        [TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY]: STATE_PENDING_PAYMENT,
        [TRANSITION_REQUEST_PAYMENT_SUBSCRIPTION_AFTER_ENQUIRY]: STATE_PENDING_PAYMENT_SUBSCRIPTION,
      },
    },
    [STATE_PENDING_PAYMENT]: {
      on: {
        [TRANSITION_EXPIRE_PAYMENT]: STATE_PAYMENT_EXPIRED,
        [TRANSITION_CONFIRM_PAYMENT]: STATE_PURCHASED,
      },
    },
    [STATE_PENDING_PAYMENT_SUBSCRIPTION]: {
      on: {
        [TRANSITION_EXPIRE_PAYMENT_SUBSCRIPTION]: STATE_PAYMENT_EXPIRED,
        [TRANSITION_CONFIRM_PAYMENT_SUBSCRIPTION]: STATE_PENDING_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION,
      },
    },

    [STATE_PENDING_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION]: {
      on: {
        [TRANSITION_EXPIRE_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION]: STATE_PAYMENT_EXPIRED,
        [TRANSITION_CONFIRM_SAVED_PAYMENT_SUBSCRIPTION]: STATE_PURCHASED_SUBSCRIPTION,
      },
    },

    [STATE_PAYMENT_EXPIRED]: {},
    [STATE_PURCHASED]: {
      on: {
        [TRANSITION_MARK_DELIVERED]: STATE_DELIVERED,
        [TRANSITION_MARK_RECEIVED_FROM_PURCHASED]: STATE_RECEIVED,
        [TRANSITION_AUTO_CANCEL]: STATE_CANCELED,
        [TRANSITION_CANCEL]: STATE_CANCELED,
      },
    },
    [STATE_PURCHASED_SUBSCRIPTION]: {
      on: {
        [TRANSITION_MARK_DELIVERED_SUBSCRIPTION]: STATE_DELIVERED_SUBSCRIPTION,
        [TRANSITION_AUTO_CANCEL_SUBSCRIPTION]: STATE_CANCELED,
      },
    },
    [STATE_DELIVERED_SUBSCRIPTION]: {
      on: {
        [TRANSITION_MARK_RECEIVED_SUBSCRIPTION]: STATE_COMPLETED,
        [TRANSITION_AUTO_MARK_RECEIVED_SUBSCRIPTION]: STATE_COMPLETED,
        [TRANSITION_CANCEL_REFUND_SUBSCRIPTION]: STATE_CANCELED,
      },
    },

    [STATE_CANCELED]: {},

    [STATE_DELIVERED]: {
      on: {
        [TRANSITION_MARK_RECEIVED]: STATE_RECEIVED,
        [TRANSITION_AUTO_MARK_RECEIVED]: STATE_RECEIVED,
        [TRANSITION_DISPUTE]: STATE_DISPUTED,
      },
    },

    [STATE_DISPUTED]: {
      on: {
        [TRANSITION_AUTO_CANCEL_FROM_DISPUTED]: STATE_CANCELED,
        [TRANSITION_CANCEL_FROM_DISPUTED]: STATE_CANCELED,
        [TRANSITION_MARK_RECEIVED_FROM_DISPUTED]: STATE_RECEIVED,
        [TRANSITION_MARK_RECEIVED_FROM_DISPUTED_BY_CUSTOMER]: STATE_RECEIVED
      },
    },

    [STATE_RECEIVED]: {
      on: {
        [TRANSITION_AUTO_COMPLETE]: STATE_COMPLETED,
      },
    },

    [STATE_COMPLETED]: {
      on: {
        [TRANSITION_EXPIRE_REVIEW_PERIOD]: STATE_REVIEWED,
        [TRANSITION_REVIEW_1_BY_CUSTOMER]: STATE_REVIEWED_BY_CUSTOMER,
        [TRANSITION_REVIEW_1_BY_PROVIDER]: STATE_REVIEWED_BY_PROVIDER,
      },
    },

    [STATE_REVIEWED_BY_CUSTOMER]: {
      on: {
        [TRANSITION_REVIEW_2_BY_PROVIDER]: STATE_REVIEWED,
        [TRANSITION_EXPIRE_PROVIDER_REVIEW_PERIOD]: STATE_REVIEWED,
      },
    },
    [STATE_REVIEWED_BY_PROVIDER]: {
      on: {
        [TRANSITION_REVIEW_2_BY_CUSTOMER]: STATE_REVIEWED,
        [TRANSITION_EXPIRE_CUSTOMER_REVIEW_PERIOD]: STATE_REVIEWED,
      },
    },
    [STATE_REVIEWED]: {
      on: {
        [TRANSITION_CANCEL_ONGOING_SUBSCRIPTION]: STATE_CANCELED,
        [TRANSITION_COMPLETE_SUBSCRIPTION]: STATE_COMPLETED_SUBSCRIPTION,
      },
    },
    [STATE_COMPLETED_SUBSCRIPTION]: { type: 'final' },
  },
};

// Note: currently we assume that state description doesn't contain nested states.
const statesFromStateDescription = description => description.states || {};

// Get all the transitions from states object in an array
const getTransitions = states => {
  const stateNames = Object.keys(states);

  const transitionsReducer = (transitionArray, name) => {
    const stateTransitions = states[name] && states[name].on;
    const transitionKeys = stateTransitions ? Object.keys(stateTransitions) : [];
    return [
      ...transitionArray,
      ...transitionKeys.map(key => ({ key, value: stateTransitions[key] })),
    ];
  };

  return stateNames.reduce(transitionsReducer, []);
};

// This is a list of all the transitions that this app should be able to handle.
export const TRANSITIONS = getTransitions(statesFromStateDescription(stateDescription)).map(
  t => t.key
);

// This function returns a function that has given stateDesc in scope chain.
const getTransitionsToStateFn = stateDesc => state =>
  getTransitions(statesFromStateDescription(stateDesc))
    .filter(t => t.value === state)
    .map(t => t.key);

// Get all the transitions that lead to specified state.
const getTransitionsToState = getTransitionsToStateFn(stateDescription);

// This is needed to fetch transactions that need response from provider.
// I.e. transactions which provider needs to accept or decline
export const transitionsToRequested = getTransitionsToState(STATE_PURCHASED);

/**
 * Helper functions to figure out if transaction is in a specific state.
 * State is based on lastTransition given by transaction object and state description.
 */

const txLastTransition = tx => ensureTransaction(tx).attributes.lastTransition;

export const txIsSubscription = tx => ensureTransaction(tx).attributes.protectedData?.type === LISTING_TYPE.SUBSCRIPTION;

export const txIsCanceled = tx =>
  getTransitionsToState(STATE_CANCELED).includes(txLastTransition(tx));

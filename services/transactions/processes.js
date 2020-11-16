export const ensureTransaction = (transaction, booking = null, listing = null, provider = null) => {
  const empty = {
    id: null,
    type: 'transaction',
    attributes: {},
    booking,
    listing,
    provider,
  };
  return { ...empty, ...transaction };
};

export const MESSAGE_SENT = 'MESSAGE_SENT';

/**
 * Transitions
 *
 * These strings must sync with values defined in Flex API,
 * since transaction objects given by API contain info about last transitions.
 * All the actions in API side happen in transitions,
 * so we need to understand what those strings mean.
 */

// When a customer makes a booking to a listing, a transaction is
// created with the initial request-payment transition.
// At this transition a PaymentIntent is created by Marketplace API.
// After this transition, the actual payment must be made on client-side directly to Stripe.
export const TRANSITION_REQUEST_PAYMENT = 'transition/request-payment';
export const TRANSITION_CASH_REQUEST_PAYMENT = "transition/cash-request-payment";
export const TRANSITION_RECORD_OFF_PLATFORM = 'transition/record-off-platform';

// A customer can also initiate a transaction with an enquiry, and
// then transition that with a request.
export const TRANSITION_ENQUIRE = 'transition/enquire';
export const TRANSITION_SEND_OFFER = "transition/send-offer";
export const TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY = 'transition/request-payment-after-enquiry';
export const TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY = "transition/cash-request-payment-after-enquiry";

// Stripe SDK might need to ask 3D security from customer, in a separate front-end step.
// Therefore we need to make another transition to Marketplace API,
// to tell that the payment is confirmed.
export const TRANSITION_CONFIRM_PAYMENT = 'transition/confirm-payment';
export const TRANSITION_CONFIRM_PAYMENT_OFFER = 'transition/confirm-payment-offer';

// If the payment is not confirmed in the time limit set in transaction process (by default 15min)
// the transaction will expire automatically.
export const TRANSITION_EXPIRE_PAYMENT = 'transition/expire-payment';

// For negotiation
export const TRANSITION_EDIT_OFFER = "transition/edit-offer";

export const TRANSITION_DECLINE_OFFER = "transition/decline-offer";
export const TRANSITION_SEND_NEW_OFFER = "transition/send-new-offer";

export const TRANSITION_SEND_OFFER_AFTER_CASH_DECLINED = "transition/send-offer-after-cash-declined";
export const TRANSITION_SEND_OFFER_AFTER_CARD_DECLINED = "transition/send-offer-after-card-declined";

export const TRANSITION_ACCEPT_OFFER_CARD_PAYMENT = "transition/accept-offer-card-payment";
export const TRANSITION_ACCEPT_OFFER_CASH_PAYMENT = "transition/accept-offer-cash-payment";
export const TRANSITION_ACCEPT_OFFER_MODAL = "transition/accept-offer-modal";

export const TRANSITION_EXPIRE_OFFER = "transition/expire-offer";
export const TRANSITION_CANCEL_OFFER = "transition/cancel-offer";

// When the provider accepts or declines a transaction from the
// SalePage, it is transitioned with the accept or decline transition.
export const TRANSITION_ACCEPT = 'transition/accept';
export const TRANSITION_DECLINE = 'transition/decline';
export const TRANSITION_CASH_ACCEPT = "transition/cash-accept";
export const TRANSITION_CASH_DECLINE = "transition/cash-decline";


// The backend automatically expire the transaction.
export const TRANSITION_EXPIRE = 'transition/expire';
export const TRANSITION_CASH_EXPIRE = "transition/cash-expire";

// Admin can also cancel the transition.
export const TRANSITION_CANCEL = 'transition/cancel';
export const TRANSITION_CASH_CANCEL = "transition/cash-cancel";

// The backend will mark the transaction completed.
export const TRANSITION_COMPLETE = 'transition/complete';
export const TRANSITION_CASH_COMPLETE = "transition/cash-complete";

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
const STATE_PREAUTHORIZED = 'preauthorized';
const STATE_DECLINED = 'declined';
const STATE_ACCEPTED = 'accepted';
const STATE_CANCELED = 'canceled';
const STATE_DELIVERED = 'delivered';
const STATE_REVIEWED = 'reviewed';
const STATE_REVIEWED_BY_CUSTOMER = 'reviewed-by-customer';
const STATE_REVIEWED_BY_PROVIDER = 'reviewed-by-provider';
const STATE_REVIEW_OFFER = "review-offer";
const STATE_OFFER_DECLINED = "offer-declined";
const STATE_OFFER_CANCELED = "offer-canceled";
const STATE_CASH_PREAUTHORIZED = "cash-preauthorized";
const STATE_CASH_ACCEPTED = "cash-accepted";
const STATE_CASH_DECLINED = "cash-declined";
const STATE_CANCELLED = "canceled";
const STATE_PENDING_PAYMENT_OFFER = 'pending-payment-offer';

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
  id: 'flex-hourly-default-process/release-1',

  // This 'initial' state is a starting point for new transaction
  initial: STATE_INITIAL,

  // States
  states: {
    [STATE_INITIAL]: {
      on: {
        [TRANSITION_ENQUIRE]: STATE_ENQUIRY,
        [TRANSITION_REQUEST_PAYMENT]: STATE_PENDING_PAYMENT,
        [TRANSITION_CASH_REQUEST_PAYMENT]: STATE_CASH_PREAUTHORIZED,
      },
    },
    [STATE_ENQUIRY]: {
      on: {
        [TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY]: STATE_PENDING_PAYMENT,
        [TRANSITION_SEND_OFFER]: STATE_REVIEW_OFFER,
        [TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY]: STATE_CASH_PREAUTHORIZED
      },
    },

    [STATE_PENDING_PAYMENT]: {
      on: {
        [TRANSITION_EXPIRE_PAYMENT]: STATE_PAYMENT_EXPIRED,
        [TRANSITION_CONFIRM_PAYMENT]: STATE_PREAUTHORIZED,
      },
    },
    [STATE_REVIEW_OFFER]: {
      on: {
        [TRANSITION_EDIT_OFFER]: STATE_REVIEW_OFFER,
        [TRANSITION_DECLINE_OFFER]: STATE_OFFER_DECLINED,
        [TRANSITION_CANCEL_OFFER]: STATE_OFFER_CANCELED,
        [TRANSITION_EXPIRE_OFFER]: STATE_OFFER_CANCELED,
        [TRANSITION_ACCEPT_OFFER_CARD_PAYMENT]: STATE_PENDING_PAYMENT_OFFER,
        [TRANSITION_ACCEPT_OFFER_CASH_PAYMENT]: STATE_CASH_ACCEPTED
      }
    },
    [STATE_PENDING_PAYMENT_OFFER]: {
      on: {
        [TRANSITION_CONFIRM_PAYMENT_OFFER]: STATE_ACCEPTED,
      },
    },
    [STATE_OFFER_DECLINED]: {
      on: {
        [TRANSITION_SEND_NEW_OFFER]: STATE_REVIEW_OFFER,
      },
    },
    [STATE_OFFER_CANCELED]: {},
    [STATE_PAYMENT_EXPIRED]: {},
    [STATE_PREAUTHORIZED]: {
      on: {
        [TRANSITION_DECLINE]: STATE_DECLINED,
        [TRANSITION_EXPIRE]: STATE_DECLINED,
        [TRANSITION_ACCEPT]: STATE_ACCEPTED,
      },
    },
    [STATE_CASH_PREAUTHORIZED]: {
      on: {
        [TRANSITION_CASH_ACCEPT]: STATE_CASH_ACCEPTED,
        [TRANSITION_CASH_DECLINE]: STATE_CASH_DECLINED,
        [TRANSITION_CASH_EXPIRE]: STATE_CASH_DECLINED
      }
    },
    [STATE_CASH_ACCEPTED]: {
      on: {
        [TRANSITION_CASH_CANCEL]: STATE_CANCELLED,
        [TRANSITION_CASH_COMPLETE]: STATE_DELIVERED
      }
    },
    [STATE_CASH_DECLINED]: {
      on: {
        [TRANSITION_SEND_OFFER_AFTER_CASH_DECLINED]: STATE_REVIEW_OFFER,
      }
    },
    [STATE_DECLINED]: {
      on: {
        [TRANSITION_SEND_OFFER_AFTER_CARD_DECLINED]: STATE_REVIEW_OFFER,
      }
    },
    [STATE_ACCEPTED]: {
      on: {
        [TRANSITION_CANCEL]: STATE_CANCELED,
        [TRANSITION_CASH_CANCEL]: STATE_CANCELED,
        [TRANSITION_COMPLETE]: STATE_DELIVERED,
      },
    },
    [STATE_CANCELED]: {},
    [STATE_DELIVERED]: {
      on: {
        [TRANSITION_REVIEW_1_BY_CUSTOMER]: STATE_REVIEWED,
        [TRANSITION_EXPIRE_REVIEW_PERIOD]: STATE_REVIEWED
      },
    },
    [STATE_REVIEWED]: { type: 'final' },
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
export const transitionsToRequested = [
  ...getTransitionsToState(STATE_PREAUTHORIZED),
  ...getTransitionsToState(STATE_CASH_PREAUTHORIZED),
];

export const customerTransitionsToRequested = [
  ...getTransitionsToState(STATE_REVIEW_OFFER),
];

/**
 * Helper functions to figure out if transaction is in a specific state.
 * State is based on lastTransition given by transaction object and state description.
 */

const txLastTransition = tx => ensureTransaction(tx).attributes.lastTransition;

export const txIsEnquired = tx =>
  getTransitionsToState(STATE_ENQUIRY).includes(txLastTransition(tx));

export const txIsPaymentPending = tx =>
  getTransitionsToState(STATE_PENDING_PAYMENT).includes(txLastTransition(tx));

export const txIsPaymentExpired = tx =>
  getTransitionsToState(STATE_PAYMENT_EXPIRED).includes(txLastTransition(tx));

// Note: state name used in Marketplace API docs (and here) is actually preauthorized
// However, word "requested" is used in many places so that we decided to keep it.
export const txIsRequested = tx =>
  getTransitionsToState(STATE_PREAUTHORIZED).includes(txLastTransition(tx)) ||
  getTransitionsToState(STATE_CASH_PREAUTHORIZED).includes(txLastTransition(tx));

export const txIsRequestedCash = tx =>
  getTransitionsToState(STATE_CASH_PREAUTHORIZED).includes(txLastTransition(tx));

export const txIsAccepted = tx =>
  getTransitionsToState(STATE_ACCEPTED).includes(txLastTransition(tx)) ||
  getTransitionsToState(STATE_CASH_ACCEPTED).includes(txLastTransition(tx));

export const txIsOffered = tx =>
  getTransitionsToState(STATE_REVIEW_OFFER).includes(txLastTransition(tx));

export const txIsDeclinedOffer = tx =>
  getTransitionsToState(STATE_OFFER_DECLINED).includes(txLastTransition(tx));

export const txIsCanceledOffer = tx =>
  getTransitionsToState(STATE_OFFER_CANCELED).includes(txLastTransition(tx));

export const txIsDeclined = tx =>
  getTransitionsToState(STATE_DECLINED).includes(txLastTransition(tx)) ||
  getTransitionsToState(STATE_CASH_DECLINED).includes(txLastTransition(tx));

export const txIsCanceled = tx =>
  getTransitionsToState(STATE_CANCELED).includes(txLastTransition(tx));

export const txIsDelivered = tx =>
  getTransitionsToState(STATE_DELIVERED).includes(txLastTransition(tx));

const firstReviewTransitions = [
  ...getTransitionsToState(STATE_REVIEWED_BY_CUSTOMER),
  ...getTransitionsToState(STATE_REVIEWED_BY_PROVIDER),
];
export const txIsInFirstReview = tx => firstReviewTransitions.includes(txLastTransition(tx));

export const txIsInFirstReviewBy = (tx, isCustomer) =>
  isCustomer
    ? getTransitionsToState(STATE_REVIEWED_BY_CUSTOMER).includes(txLastTransition(tx))
    : getTransitionsToState(STATE_REVIEWED_BY_PROVIDER).includes(txLastTransition(tx));

export const txIsReviewed = tx =>
  getTransitionsToState(STATE_REVIEWED).includes(txLastTransition(tx));

/**
 * Helper functions to figure out if transaction has passed a given state.
 * This is based on transitions history given by transaction object.
 */

const txTransitions = tx => ensureTransaction(tx).attributes.transitions || [];
const hasPassedTransition = (transitionName, tx) =>
  !!txTransitions(tx).find(t => t.transition === transitionName);

const hasPassedStateFn = state => tx =>
  getTransitionsToState(state).filter(t => hasPassedTransition(t, tx)).length > 0;

export const txHasBeenAccepted = tx => hasPassedStateFn(STATE_ACCEPTED)(tx) ||
  hasPassedStateFn(STATE_CASH_ACCEPTED)(tx);
export const txHasBeenDelivered = hasPassedStateFn(STATE_DELIVERED);

export const txHasSentOffer = (tx) => {
  return hasPassedStateFn(STATE_REVIEW_OFFER)(tx)
}

export const hasPassedTransitionSendOffer = (tx) => hasPassedTransition(TRANSITION_SEND_OFFER, tx);

/**
 * Other transaction related utility functions
 */

export const transitionIsReviewed = transition =>
  getTransitionsToState(STATE_REVIEWED).includes(transition);

export const transitionIsFirstReviewedBy = (transition, isCustomer) =>
  isCustomer
    ? getTransitionsToState(STATE_REVIEWED_BY_CUSTOMER).includes(transition)
    : getTransitionsToState(STATE_REVIEWED_BY_PROVIDER).includes(transition);

export const getReview1Transition = isCustomer =>
  isCustomer ? TRANSITION_REVIEW_1_BY_CUSTOMER : TRANSITION_REVIEW_1_BY_PROVIDER;

export const getReview2Transition = isCustomer =>
  isCustomer ? TRANSITION_REVIEW_2_BY_CUSTOMER : TRANSITION_REVIEW_2_BY_PROVIDER;

// Check if a transition is the kind that should be rendered
// when showing transition history (e.g. ActivityFeed)
// The first transition and most of the expiration transitions made by system are not relevant
export const isRelevantPastTransition = transition => {
  return [
    TRANSITION_SEND_OFFER,
    TRANSITION_CANCEL_OFFER,
    TRANSITION_SEND_NEW_OFFER,
    TRANSITION_ACCEPT_OFFER_CARD_PAYMENT,
    TRANSITION_ACCEPT_OFFER_CASH_PAYMENT,
    TRANSITION_DECLINE_OFFER,
    TRANSITION_ACCEPT,
    TRANSITION_CANCEL,
    TRANSITION_COMPLETE,
    TRANSITION_CONFIRM_PAYMENT,
    TRANSITION_CASH_REQUEST_PAYMENT,
    TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY,
    TRANSITION_DECLINE,
    TRANSITION_EXPIRE,
    TRANSITION_REVIEW_1_BY_CUSTOMER,
    TRANSITION_REVIEW_1_BY_PROVIDER,
    TRANSITION_REVIEW_2_BY_CUSTOMER,
    TRANSITION_REVIEW_2_BY_PROVIDER,
    TRANSITION_CASH_ACCEPT,
    TRANSITION_CASH_CANCEL,
    TRANSITION_CASH_DECLINE,
    TRANSITION_CASH_EXPIRE,
    TRANSITION_CASH_COMPLETE,
  ].includes(transition);
};

export const isCustomerReview = transition => {
  return [TRANSITION_REVIEW_1_BY_CUSTOMER, TRANSITION_REVIEW_2_BY_CUSTOMER].includes(transition);
};

export const isProviderReview = transition => {
  return [TRANSITION_REVIEW_1_BY_PROVIDER, TRANSITION_REVIEW_2_BY_PROVIDER].includes(transition);
};

export const getUserTxRole = (currentUserId, transaction) => {
  const tx = ensureTransaction(transaction);
  const customer = tx.customer;
  if (currentUserId && currentUserId.uuid && tx.id && customer.id) {
    // user can be either customer or provider
    return currentUserId.uuid === customer.id.uuid
      ? TX_TRANSITION_ACTOR_CUSTOMER
      : TX_TRANSITION_ACTOR_PROVIDER;
  } else {
    throw new Error(`Parameters for "userIsCustomer" function were wrong.
      currentUserId: ${currentUserId}, transaction: ${transaction}`);
  }
};

export const txRoleIsProvider = userRole => userRole === TX_TRANSITION_ACTOR_PROVIDER;
export const txRoleIsCustomer = userRole => userRole === TX_TRANSITION_ACTOR_CUSTOMER;

// Check if the given transition is privileged.
//
// Privileged transitions need to be handled from a secure context,
// i.e. the backend. This helper is used to check if the transition
// should go through the local API endpoints, or if using JS SDK is
// enough.
export const isPrivileged = transition => {
  return [
    TRANSITION_ACCEPT_OFFER_CARD_PAYMENT,
    TRANSITION_ACCEPT_OFFER_CASH_PAYMENT,
    TRANSITION_REQUEST_PAYMENT_AFTER_ENQUIRY,
    TRANSITION_REQUEST_PAYMENT,
    TRANSITION_CASH_REQUEST_PAYMENT_AFTER_ENQUIRY,
    TRANSITION_CASH_REQUEST_PAYMENT,
    TRANSITION_RECORD_OFF_PLATFORM
  ].includes(
    transition
  );
};


// Check if a transition is the kind that should not display
// price when exporting CSV file.
export const isTransitionWithoutPrice = transition => {
  return [
    TRANSITION_CANCEL_OFFER,
    TRANSITION_DECLINE_OFFER,
    TRANSITION_EXPIRE_OFFER,
    TRANSITION_CANCEL,
    TRANSITION_EXPIRE_PAYMENT,
    TRANSITION_DECLINE,
    TRANSITION_EXPIRE,
    TRANSITION_CASH_CANCEL,
    TRANSITION_CASH_DECLINE,
    TRANSITION_CASH_EXPIRE,
  ].includes(transition);
};

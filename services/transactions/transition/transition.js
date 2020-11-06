import { handleUserActionEvent, MESSAGE_SENT } from '../../event';
import { sdk } from '../../sharetribe';
import {
  TRANSITION_ACCEPT,
  TRANSITION_CASH_ACCEPT,
  TRANSITION_CASH_DECLINE,
  TRANSITION_DECLINE,
  TRANSITION_DECLINE_OFFER,
  TRANSITION_EDIT_OFFER,
  TRANSITION_SEND_NEW_OFFER,
  TRANSITION_SEND_OFFER
} from '../processes';
import execPreTransitActions from './pre_transition';

const composeMRight = method => (...ms) => (
  ms.reduceRight((f, g) => x => g(x)[method](f))
);
//This one is used to inject your own logic onto the current execution
//Result of the previous function is the args of the current function
const composePromises = composeMRight('then');

const EVENT_ONLY_TRANSITION = [
  TRANSITION_CASH_ACCEPT,
  TRANSITION_CASH_DECLINE,
  TRANSITION_ACCEPT,
  TRANSITION_DECLINE,
  TRANSITION_EDIT_OFFER,
  TRANSITION_SEND_OFFER,
  TRANSITION_SEND_NEW_OFFER,
  TRANSITION_DECLINE_OFFER,
  MESSAGE_SENT
];

const handlePrivilegeTransition = composePromises(
  execPreTransitActions,
  sdk.jh.trustedTransactions.transition
);

const transition = async (fnParams) => {
  const { id, transition, params } = fnParams;

  const isEventHandleFlow = EVENT_ONLY_TRANSITION.includes(transition);

  return isEventHandleFlow
    ? handleUserActionEvent({
      id,
      action: transition,
      metadata: params
    })
    : handlePrivilegeTransition(fnParams);
}

export default transition;